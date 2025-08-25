import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import PackingItem from "./PackingItem";
import "./PackingListSummary.css";

const PackingListSummary = ({ tripId, days }) => {
  const [packingItems, setPackingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all packing items for the trip
  const fetchPackingItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("packing_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("name", { ascending: true });

      if (error) throw error;
      setPackingItems(data || []);
    } catch (error) {
      console.error("Error fetching packing items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle packed status for all items with the same name
  const togglePacked = async (itemId, currentStatus) => {
    try {
      // Find the item to get its name
      const item = packingItems.find(i => i.id === itemId);
      if (!item) return;

      // Update all items with the same name
      const { data, error } = await supabase
        .from("packing_items")
        .update({ is_packed: !currentStatus })
        .eq("trip_id", tripId)
        .eq("name", item.name);

      if (error) throw error;
      
      // Update local state for all matching items
      setPackingItems(prevItems =>
        prevItems.map(i => 
          i.name === item.name ? { ...i, is_packed: !currentStatus } : i
        )
      );
      
      // Refresh the list to ensure consistency
      fetchPackingItems();
    } catch (error) {
      console.error("Error updating packed status:", error);
    }
  };

  // Group items by name and count duplicates
  const groupItems = (items) => {
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.name]) {
        grouped[item.name] = { ...item, count: 1 };
      } else {
        grouped[item.name].count += 1;
      }
    });
    return Object.values(grouped);
  };

  // Categorize items
  const categorizedItems = packingItems.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Process each category to group items
  Object.keys(categorizedItems).forEach(category => {
    categorizedItems[category] = groupItems(categorizedItems[category]);
  });

  useEffect(() => {
    fetchPackingItems();
  }, [tripId]);

  if (loading) return <div className="loading">Loading packing list...</div>;

  return (
    <div className="packing-list-summary">
      <h2>Packing List Summary</h2>
      
      <div className="packing-stats">
        <div className="stat">
          <span className="stat-number">{packingItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {packingItems.filter(item => item.is_packed).length}
          </span>
          <span className="stat-label">Packed</span>
        </div>
      </div>

      <div className="categories-container">
        {Object.entries(categorizedItems).map(([category, items]) => (
          <div key={category} className="category-section">
            <h3>{category}</h3>
            <div className="items-list">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`packing-summary-item ${item.is_packed ? 'packed' : ''}`}
                  onClick={() => togglePacked(item.id, item.is_packed)}
                >
                  <div className="item-checkbox">
                    {item.is_packed ? (
                      <span className="checkmark">✓</span>
                    ) : (
                      <span className="checkbox"></span>
                    )}
                  </div>
                  <span className="item-name">
                    {item.name}
                    {item.count > 1 && <span className="item-count">{item.count}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackingListSummary;
