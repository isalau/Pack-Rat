import { useState, useEffect } from "react";
import { FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { supabase } from "../../lib/supabase";
import "./PackingList.css";

const BagSection = ({ tripId }) => {
  const [bags, setBags] = useState([]);
  const [showBagForm, setShowBagForm] = useState(false);
  const [bagName, setBagName] = useState("");
  const [currentBag, setCurrentBag] = useState(null);
  const [newItem, setNewItem] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bags when component mounts or tripId changes
  useEffect(() => {
    const fetchBags = async () => {
      if (!tripId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('bags')
          .select(`
            *,
            bag_items (*)
          `)
          .eq('trip_id', tripId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        setBags(data || []);
      } catch (err) {
        console.error('Error fetching bags:', err);
        setError('Failed to load bags');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBags();
  }, [tripId]);

  const addBag = async (e) => {
    e.preventDefault();
    if (!bagName.trim()) return;
    
    if (!tripId) {
      setError("Cannot add bag: No trip selected");
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error("You must be logged in to add a bag");
      }

      const { data, error } = await supabase
        .from("bags")
        .insert([{ 
          trip_id: tripId, 
          name: bagName.trim(),
          user_id: session.user.id
        }])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setBags([...bags, data[0]]);
        setBagName("");
        setShowBagForm(false);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      console.error("Error adding bag:", err);
      setError("Failed to add bag");
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToBag = async (bagId, e) => {
    e.preventDefault();
    if (!newItem.trim() || !bagId) return;

    try {
      const { data, error } = await supabase
        .from("bag_items")
        .insert([
          { 
            bag_id: bagId, 
            name: newItem.trim(), 
            category,
            packed: false 
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        setBags(
          bags.map((bag) =>
            bag.id === bagId
              ? { ...bag, items: [...(bag.items || []), data[0]] }
              : bag
          )
        );
        setNewItem("");
        setCategory("Clothing");
      }
    } catch (err) {
      console.error("Error adding item to bag:", err);
      setError("Failed to add item to bag");
    }
  };

  const toggleItemPacked = async (bagId, itemId, packed) => {
    try {
      const { error } = await supabase
        .from("bag_items")
        .update({ packed: !packed })
        .eq("id", itemId);

      if (error) throw error;

      setBags(
        bags.map((bag) =>
          bag.id === bagId
            ? {
                ...bag,
                items: bag.items.map((item) =>
                  item.id === itemId ? { ...item, packed: !packed } : item
                ),
              }
            : bag
        )
      );
    } catch (err) {
      console.error("Error updating item status:", err);
      setError("Failed to update item status");
    }
  };

  const removeItemFromBag = async (bagId, itemId) => {
    try {
      const { error } = await supabase
        .from("bag_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setBags(
        bags.map((bag) =>
          bag.id === bagId
            ? {
                ...bag,
                items: bag.items.filter((item) => item.id !== itemId),
              }
            : bag
        )
      );
    } catch (err) {
      console.error("Error removing item from bag:", err);
      setError("Failed to remove item from bag");
    }
  };

  return (
    <div className="packing-list">
      <h2>Bags</h2>
      {error && <div className="error">{error}</div>}

      {!showBagForm ? (
        <button
          className="btn btn-primary"
          onClick={() => setShowBagForm(true)}
          disabled={isLoading}
        >
          <FaPlus />
          <span>Add Bag</span>
        </button>
      ) : (
        <form onSubmit={addBag} className="add-bag-form">
          <input
            type="text"
            value={bagName}
            onChange={(e) => setBagName(e.target.value)}
            placeholder="Enter bag name"
            className="item-input"
            aria-label="Bag Name"
            autoFocus
          />
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowBagForm(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !bagName.trim()}
            >
              {isLoading ? 'Adding...' : 'Add Bag'}
            </button>
          </div>
        </form>
      )}

      <div className="bags-container">
        {bags.map((bag) => (
          <div key={bag.id} className="bag-card">
            <div className="bag-header">
              <h3>{bag.name}</h3>
              <button
                className="icon-button"
                onClick={() =>
                  setCurrentBag(currentBag?.id === bag.id ? null : bag)
                }
                aria-label={currentBag?.id === bag.id ? 'Collapse bag' : 'Expand bag'}
              >
                {currentBag?.id === bag.id ? <FaTimes /> : <FaPlus />}
              </button>
            </div>

            {currentBag?.id === bag.id && (
              <div className="bag-content">
                <form
                  onSubmit={(e) => addItemToBag(bag.id, e)}
                  className="add-item-form"
                >
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
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Documents">Documents</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Meds">Meds</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Toiletries">Toiletries</option>
                    <option value="Travel">Travel</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    type="submit"
                    className="add-button"
                    disabled={!newItem.trim() || isLoading}
                  >
                    Add
                  </button>
                </form>

                <ul className="items-list">
                  {bag.items?.map((item) => (
                    <li key={item.id} className="item">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() =>
                            toggleItemPacked(bag.id, item.id, item.packed)
                          }
                          aria-label={`Mark ${item.name} as ${
                            item.packed ? 'unpacked' : 'packed'
                          }`}
                        />
                        <span className={`item-name ${item.packed ? 'packed' : ''}`}>
                          {item.name}
                        </span>
                        <span className="item-category">{item.category}</span>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => removeItemFromBag(bag.id, item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <FaTrash />
                        </button>
                      </label>
                    </li>
                  ))}
                  {!bag.items?.length && (
                    <li className="empty-state">
                      <p>No items in this bag yet. Add some items above.</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BagSection;
