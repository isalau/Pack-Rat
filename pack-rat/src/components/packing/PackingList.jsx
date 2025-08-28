import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import PackingItem from "./PackingItem";
import { FaTrash, FaTimes } from "react-icons/fa";
import "./PackingList.css";

const PackingList = ({ tripId, totalDays, day }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]); // [{ id, name }]
  const [eventItemsMap, setEventItemsMap] = useState({}); // { [event_id]: Set(names) }

  useEffect(() => {
    fetchPackingItems();
  }, [tripId, day]);

  // Fetch events for this day and the template items associated with them
  useEffect(() => {
    const fetchEventsAndItems = async () => {
      try {
        // Get event instances for this trip/day
        const { data: instances, error: instErr } = await supabase
          .from("event_instances")
          .select("*")
          .eq("trip_id", tripId)
          .eq("day", day);
        if (instErr) throw instErr;

        const eventIds = (instances || []).map((i) => i.event_id);
        if (!eventIds.length) {
          setEvents([]);
          setEventItemsMap({});
          return;
        }

        // Fetch event meta (name/title)
        const { data: eventsData, error: eventsErr } = await supabase
          .from("events")
          .select("id, name")
          .in("id", eventIds);
        if (eventsErr) throw eventsErr;
        setEvents(eventsData || []);

        // Fetch template items for these events
        const { data: eventItems, error: evItemsErr } = await supabase
          .from("event_items")
          .select("event_id, name")
          .in("event_id", eventIds);
        if (evItemsErr) throw evItemsErr;

        const map = {};
        (eventItems || []).forEach((row) => {
          if (!map[row.event_id]) map[row.event_id] = new Set();
          map[row.event_id].add(row.name);
        });
        setEventItemsMap(map);
      } catch (e) {
        console.error("Error fetching events/items for day:", e);
        // Do not block packing list; just show items flat if needed
        setEvents([]);
        setEventItemsMap({});
      }
    };

    if (tripId && day != null) {
      fetchEventsAndItems();
    }
  }, [tripId, day]);

  const fetchPackingItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("packing_items")
        .select("*")
        .eq("trip_id", tripId)
        .eq("day", day)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching packing items:", err);
      setError("Failed to load packing items");
    } finally {
      setIsLoading(false);
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
        .from("packing_items")
        .insert([
          {
            trip_id: tripId,
            name: newItem.trim(),
            category,
            day: parseInt(day, 10),
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setItems([...items, data[0]]);
        setNewItem("");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item");
    }
  };

  const handleUpdateItem = async (id, updates) => {
    try {
      const { error } = await supabase
        .from("packing_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setItems(
        items.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update item");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from("packing_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event and all its associated items?"
      )
    ) {
      return;
    }

    try {
      // Get the event template items to know which items to delete
      const { data: templateItems, error: templateError } = await supabase
        .from("event_items")
        .select("name")
        .eq("event_id", eventId);

      if (templateError) throw templateError;

      // If there are template items, delete matching packing items
      if (templateItems && templateItems.length > 0) {
        const itemNames = templateItems.map((item) => item.name);
        const { error: deleteError } = await supabase
          .from("packing_items")
          .delete()
          .eq("trip_id", tripId)
          .eq("day", day)
          .in("name", itemNames);

        if (deleteError) throw deleteError;
      }

      // Delete the event instance
      const { error: eventError } = await supabase
        .from("event_instances")
        .delete()
        .eq("trip_id", tripId)
        .eq("day", day)
        .eq("event_id", eventId);

      if (eventError) throw eventError;

      // Refresh the data
      fetchPackingItems();

      // Refetch events to update the UI
      const { data: instances } = await supabase
        .from("event_instances")
        .select("*")
        .eq("trip_id", tripId)
        .eq("day", day);

      const eventIds = (instances || []).map((i) => i.event_id);
      if (eventIds.length > 0) {
        const { data: eventsData } = await supabase
          .from("events")
          .select("id, name")
          .in("id", eventIds);
        setEvents(eventsData || []);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event");
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
          aria-label="Item Name"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
          aria-label="Select a category"
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
                <h4 className="event-title">{event.name || "Event"}</h4>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteEvent(event.id);
                  }}
                  className="delete-event-button"
                  title="Delete event"
                >
                  <FaTrash className="delete-trip-icon" />
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
