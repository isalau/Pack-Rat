import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import "./EventForm.css";

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tripId, setTripId] = useState(null);
  const [day, setDay] = useState(null);

  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    items: [{ name: "", category: "Clothing", quantity: 1 }],
  });

  // Check URL for tripId and day parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tripIdParam = params.get("tripId");
    const dayParam = params.get("day");

    if (tripIdParam) setTripId(tripIdParam);
    if (dayParam) setDay(parseInt(dayParam, 10));
  }, []);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (eventError) throw eventError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("event_items")
        .select("*")
        .eq("event_id", id);

      if (itemsError) throw itemsError;

      setFormData({
        name: eventData.name,
        description: eventData.description || "",
        items:
          itemsData.length > 0
            ? itemsData
            : [{ name: "", category: "Clothing", quantity: 1 }],
      });
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", category: "Clothing", quantity: 1 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Create or update event
      if (!user) {
        throw new Error("User not authenticated");
      }

      const eventData = {
        name: formData.name.trim().toLowerCase(),
        description: formData.description.trim().toLowerCase() || null,
        user_id: user.id,
      };

      let eventId = id;

      if (id) {
        // Update existing event
        const { error: updateError } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", id);

        if (updateError) throw updateError;
      } else {
        // Create new event
        const { data: newEvent, error: createError } = await supabase
          .from("events")
          .insert([eventData])
          .select()
          .single();

        if (createError) throw createError;
        eventId = newEvent.id;
      }

      // Update event items
      const { data: existingItems } = await supabase
        .from("event_items")
        .select("id")
        .eq("event_id", eventId);

      const existingItemIds = existingItems?.map((item) => item.id) || [];
      const newItems = [];
      const updatedItems = [];

      // Process items
      for (const item of formData.items) {
        const itemData = {
          event_id: eventId,
          name: item.name.trim(),
          category: item.category,
          quantity: parseInt(item.quantity, 10) || 1,
        };

        if (item.id) {
          updatedItems.push({ ...itemData, id: item.id });
        } else {
          newItems.push(itemData);
        }
      }

      // Delete removed items
      const removedItems = existingItemIds.filter(
        (id) => !formData.items.some((item) => item.id === id)
      );

      if (removedItems.length > 0) {
        const { error: deleteError } = await supabase
          .from("event_items")
          .delete()
          .in("id", removedItems);

        if (deleteError) throw deleteError;
      }

      // Update existing items
      for (const item of updatedItems) {
        const { error: updateError } = await supabase
          .from("event_items")
          .update(item)
          .eq("id", item.id);

        if (updateError) throw updateError;
      }

      // Add new items
      if (newItems.length > 0) {
        const { error: insertError } = await supabase
          .from("event_items")
          .insert(newItems);

        if (insertError) throw insertError;
      }

      // If this is a new event and we have tripId and day, add to trip immediately
      if (!id && tripId && day) {
        const { error: instanceError } = await supabase
          .from("event_instances")
          .insert([
            {
              event_id: eventId,
              trip_id: tripId,
              day: day,
            },
          ]);

        if (instanceError) throw instanceError;

        // Add items to packing list for this day
        const itemsToAdd = formData.items.map((item) => ({
          trip_id: tripId,
          name: item.name.trim(),
          category: item.category,
          quantity: parseInt(item.quantity, 10) || 1,
          day: day,
          is_packed: false,
        }));

        const { error: itemsError } = await supabase
          .from("packing_items")
          .insert(itemsToAdd);

        if (itemsError) throw itemsError;

        // Navigate back to the trip
        navigate(`/trip/${tripId}`);
        return;
      }

      navigate("/events", { replace: true });
    } catch (err) {
      console.error("Error saving event:", err);
      setError(err.message || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return <div className="loading">Loading event...</div>;
  }

  return (
    <div className="event-form-container">
      <h2>{id ? "Edit Event" : "Create New Event"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Event Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Work Day, Hiking Trip, Beach Day"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add any notes about this event"
            rows="3"
          />
        </div>

        <div className="form-group">
          <div className="form-group-header">
            <label>Items to Pack</label>
            <button type="button" className="btn btn-sm" onClick={addItem}>
              + Add Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="item-row">
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) =>
                  handleItemChange(index, "name", e.target.value)
                }
                required
              />

              <select
                value={item.category}
                onChange={(e) =>
                  handleItemChange(index, "category", e.target.value)
                }
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

              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                className="quantity-input"
              />

              <button
                type="button"
                className="btn btn-icon danger"
                onClick={() => removeItem(index)}
                disabled={formData.items.length <= 1}
                title="Remove item"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(id ? `/events/${id}` : "/events")}
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
