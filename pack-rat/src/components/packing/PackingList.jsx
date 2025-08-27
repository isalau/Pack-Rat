import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import PackingItem from './PackingItem';
import './PackingList.css';

const PackingList = ({ tripId, totalDays, day }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]); // [{ id, name }]
  const [eventItemsMap, setEventItemsMap] = useState({}); // { [event_id]: Set(names) }

  useEffect(() => {
    fetchPackingItems();
  }, [tripId, day]);

  // Fetch events for this day and the template items associated with them
  const fetchEventsAndItems = useCallback(async () => {
    try {
      if (!(tripId && day != null)) return;
      // Get event instances for this trip/day
      const { data: instances, error: instErr } = await supabase
        .from('event_instances')
        .select('*')
        .eq('trip_id', tripId)
        .eq('day', day);
      if (instErr) throw instErr;

      const eventIds = (instances || []).map((i) => i.event_id);
      if (!eventIds.length) {
        setEvents([]);
        setEventItemsMap({});
        return;
      }

      // Fetch event meta (name/title)
      const { data: eventsData, error: eventsErr } = await supabase
        .from('events')
        .select('id, name')
        .in('id', eventIds);
      if (eventsErr) throw eventsErr;
      setEvents(eventsData || []);

      // Fetch template items for these events
      const { data: eventItems, error: evItemsErr } = await supabase
        .from('event_items')
        .select('event_id, name')
        .in('event_id', eventIds);
      if (evItemsErr) throw evItemsErr;

      const map = {};
      (eventItems || []).forEach((row) => {
        if (!map[row.event_id]) map[row.event_id] = new Set();
        map[row.event_id].add(row.name);
      });
      setEventItemsMap(map);
    } catch (e) {
      console.error('Error fetching events/items for day:', e);
      // Do not block packing list; just show items flat if needed
      setEvents([]);
      setEventItemsMap({});
    }
  }, [tripId, day]);

  useEffect(() => {
    fetchEventsAndItems();
  }, [fetchEventsAndItems]);

  const fetchPackingItems = async () => {
    try {
      setIsLoading(true);
      // Fetch all packing items for this trip and day
      const { data, error } = await supabase
        .from('packing_items')
        .select('*')
        .eq('trip_id', tripId)
        .eq('day', day)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching packing items:', err);
      setError('Failed to load packing items');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove an event from the given day (and its related packing items)
  const handleRemoveEventFromDay = async (eventId) => {
    const confirmRemove = window.confirm('Remove this event from the day? This will also remove its items for this day.');
    if (!confirmRemove) return;
    try {
      // Get template item names for this event
      const { data: evItems, error: evErr } = await supabase
        .from('event_items')
        .select('name')
        .eq('event_id', eventId);
      if (evErr) throw evErr;
      const names = (evItems || []).map((r) => r.name);

      // Delete packing items for this event/day if names exist
      if (names.length > 0) {
        const { error: delItemsErr } = await supabase
          .from('packing_items')
          .delete()
          .eq('trip_id', tripId)
          .eq('day', day)
          .in('name', names);
        if (delItemsErr) throw delItemsErr;
      }

      // Delete the event instance (unlink from this day)
      const { error: delInstanceErr } = await supabase
        .from('event_instances')
        .delete()
        .eq('trip_id', tripId)
        .eq('day', day)
        .eq('event_id', eventId);
      if (delInstanceErr) throw delInstanceErr;

      // Refresh lists
      await fetchPackingItems();
      await fetchEventsAndItems();
    } catch (e) {
      console.error('Failed to remove event from day:', e);
      alert('Failed to remove event from day');
    }
  };

  // Compute grouping: map items to the event whose template list contains their name
  const grouped = useMemo(() => {
    const remaining = [...items];
    const groups = events.map((ev) => {
      const names = eventItemsMap[ev.id] || new Set();
      const belong = remaining.filter((it) => names.has(it.name));
      // remove assigned from remaining
      if (belong.length) {
        belong.forEach((b) => {
          const idx = remaining.findIndex((r) => r.id === b.id);
          if (idx !== -1) remaining.splice(idx, 1);
        });
      }
      return { event: ev, items: belong };
    });
    return { groups, others: remaining };
  }, [items, events, eventItemsMap]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const { data, error } = await supabase
        .from('packing_items')
        .insert([
          { 
            trip_id: tripId, 
            name: newItem.trim(), 
            category,
            day: parseInt(day, 10) 
          }
        ])
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        setItems([...items, data[0]]);
        setNewItem('');
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
    }
  };

  const handleUpdateItem = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('packing_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setItems(items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from('packing_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  if (isLoading) {
    return <div className="loading">Loading items...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="packing-list">
      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add an item..."
          className="item-input"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="Clothing">Clothing</option>
          <option value="Toiletries">Toiletries</option>
          <option value="Electronics">Electronics</option>
          <option value="Documents">Documents</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="add-button">
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No items added yet. Start by adding items above.</p>
        </div>
      ) : (
        <div className="items-container">
          {/* Render grouped by events */}
          {grouped.groups.map(({ event, items: evItems }) => (
            <div key={event.id} className="event-group">
              <div className="event-group__header">
                <h4 className="event-title">{event.name || 'Event'}</h4>
                <button
                  type="button"
                  className="event-remove-button"
                  title="Remove event from this day"
                  onClick={() => handleRemoveEventFromDay(event.id)}
                >
                  Remove Event
                </button>
              </div>
              {evItems.length === 0 ? (
                <div className="empty-sublist">No items for this event.</div>
              ) : (
                evItems.map((item) => (
                  <PackingItem
                    key={item.id}
                    item={{ ...item, totalDays }}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                  />
                ))
              )}
            </div>
          ))}

          {/* Remaining items without an event association */}
          {grouped.others.length > 0 && (
            <div className="event-group">
              <div className="event-group__header">
                <h4 className="event-title">Other items</h4>
              </div>
              {grouped.others.map((item) => (
                <PackingItem
                  key={item.id}
                  item={{ ...item, totalDays }}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackingList;
