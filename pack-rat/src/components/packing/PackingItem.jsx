import { useState } from "react";
import { FaTimes } from "react-icons/fa";

import "./PackingItem.css";

const PackingItem = ({ item, onUpdate, onDelete, onTogglePacked }) => {
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
      <div className={`packing-item ${item.is_packed ? 'packed' : ''}`}>
        <input
          type="checkbox"
          checked={item.is_packed}
          onChange={onTogglePacked || (() => onUpdate?.(item.id, { is_packed: !item.is_packed }))}
          className="packed-checkbox"
        />
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
      </div>
    );
  }

  const handleDeleteItems = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${item.name}"?`)) {
      if (onDelete) {
        onDelete(item.id);
      }
    }
  };

  return (
    <div className={`packing-item ${item.is_packed ? 'packed' : ''}`}>
      <input
        type="checkbox"
        checked={item.is_packed || false}
        onChange={onTogglePacked || (() => onUpdate?.(item.id, { is_packed: !item.is_packed }))}
        className="packed-checkbox"
      />
      <span className="item-name">
        {item.name}
        {item.count > 1 && <span className="item-count">×{item.count}</span>}
        {item.category && <span className="item-category">{item.category}</span>}
      </span>
      {onDelete && (
        <button
          onClick={handleDeleteItems}
          className="delete-trip-button"
          title="Delete item"
        >
          <FaTimes className="delete-trip-item-icon" />
        </button>
      )}
    </div>
  );
};

export default PackingItem;
