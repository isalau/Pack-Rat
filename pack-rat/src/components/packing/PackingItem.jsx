import { useState } from "react";
import { FaTimes } from "react-icons/fa";

import "./PackingItem.css";

const PackingItem = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedCategory, setEditedCategory] = useState(item.category);
  const [editedDay, setEditedDay] = useState(item.day);

  const handleSave = () => {
    onUpdate(item.id, {
      name: editedName,
      category: editedCategory,
      day: parseInt(editedDay, 10),
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="packing-item editing">
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          className="item-input"
        />
        <select
          value={editedCategory}
          onChange={(e) => setEditedCategory(e.target.value)}
          className="category-select"
        >
          <option value="Clothing">Clothing</option>
          <option value="Toiletries">Toiletries</option>
          <option value="Electronics">Electronics</option>
          <option value="Documents">Documents</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={editedDay}
          onChange={(e) => setEditedDay(e.target.value)}
          className="day-select"
        >
          {[...Array(item.totalDays || 1).keys()].map((day) => (
            <option key={day + 1} value={day + 1}>
              Day {day + 1}
            </option>
          ))}
        </select>
        {/* <div className="item-actions">
          <button
            onClick={handleSave}
            className="icon-button"
            aria-label="Save"
          >
            <FaSave />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="icon-button"
            aria-label="Cancel"
          >
            <FaTimes />
          </button>
        </div> */}
      </div>
    );
  }

  const handleDeleteItems = async (e) => {
    // TODO: delete event from day
  };

  return (
    <div className="packing-item">
      <span className="item-name">{item.name}</span>
      {/* <button
        onClick={handleDeleteItems}
        className="delete-trip-button"
        title="Delete event"
      >
        <FaTimes className="delete-trip-item-icon" />
      </button> */}
    </div>
  );
};

export default PackingItem;
