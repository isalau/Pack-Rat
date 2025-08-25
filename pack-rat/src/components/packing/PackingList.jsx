import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import PackingItem from './PackingItem';
import './PackingList.css';

const PackingList = ({ tripId, totalDays, day }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackingItems();
  }, [tripId, day]);

  const fetchPackingItems = async () => {
    try {
      setIsLoading(true);
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
          {items.map((item) => (
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
  );
};

export default PackingList;
