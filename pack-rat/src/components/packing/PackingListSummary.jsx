import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import PackingItem from "./PackingItem";
import "./PackingListSummary.css";

const PackingListSummary = ({ tripId, days }) => {
  const [packingItems, setPackingItems] = useState([]);
  const [bagItems, setBagItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all packing items for the trip
  const fetchPackingItems = async () => {
    try {
      setLoading(true);
      
      // Fetch regular packing items
      const { data: packingData, error: packingError } = await supabase
        .from("packing_items")
        .select("*")
        .eq("trip_id", tripId);

      if (packingError) throw packingError;

      // Fetch bag items
      const { data: bagsData, error: bagsError } = await supabase
        .from("bags")
        .select(`
          *,
          bag_items (*)
        `)
        .eq("trip_id", tripId);

      if (bagsError) throw bagsError;

      // Flatten bag items and add a source identifier
      const allBagItems = bagsData.flatMap(bag => 
        (bag.bag_items || []).map(item => ({
          ...item,
          source: 'bag',
          bag_name: bag.name
        }))
      );

      setPackingItems(packingData || []);
      setBagItems(allBagItems);
    } catch (error) {
      console.error("Error fetching items:", error);
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

  // Combine and prepare items for display
  const getAllItems = () => {
    // Add source and format packing items
    const formattedPackingItems = (packingItems || []).map(item => ({
      ...item,
      source: 'packing_list',
      packed: item.is_packed || false
    }));

    // Combine all items
    const allItems = [...formattedPackingItems, ...(bagItems || [])];

    // Group items by name and count duplicates
    const grouped = allItems.reduce((acc, item) => {
      const key = `${item.name}-${item.category || 'Uncategorized'}`;
      if (!acc[key]) {
        acc[key] = { 
          ...item, 
          count: 1,
          sources: [item.source],
          bag_names: item.source === 'bag' ? [item.bag_name] : []
        };
      } else {
        acc[key].count += 1;
        if (!acc[key].sources.includes(item.source)) {
          acc[key].sources.push(item.source);
        }
        if (item.source === 'bag' && !acc[key].bag_names.includes(item.bag_name)) {
          acc[key].bag_names.push(item.bag_name);
        }
      }
      return acc;
    }, {});

    // Categorize items
    return Object.values(grouped).reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  };

  const categorizedItems = getAllItems();

  useEffect(() => {
    fetchPackingItems();
  }, [tripId]);

  if (loading) return <div className="loading">Loading packing list...</div>;

  return (
    <div className="packing-list-summary">
      <h2>Packing List Summary</h2>
      
      <div className="packing-stats">
        <div className="stat">
          <span className="stat-number">
            {packingItems.length + bagItems.length}
          </span>
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
            <div className="items-grid">
              {items.map((item) => {
                const sourceInfo = [];
                if (item.sources.includes('packing_list')) sourceInfo.push('Packing List');
                if (item.bag_names?.length > 0) {
                  sourceInfo.push(`Bags: ${item.bag_names.join(', ')}`);
                }
                
                return (
                  <div key={`${category}-${item.name}`} className="item-container">
                    <PackingItem
                      item={{
                        ...item,
                        is_packed: item.packed,
                        name: item.name,
                        count: item.count
                      }}
                      onTogglePacked={() => togglePacked(item.id, item.packed)}
                    />
                    {sourceInfo.length > 0 && (
                      <div className="item-sources">
                        {sourceInfo.join(' • ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackingListSummary;
