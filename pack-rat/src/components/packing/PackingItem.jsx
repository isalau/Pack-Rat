import { useState } from "react";
import { FaTrash, FaCheck, FaTimes, FaEdit, FaSave } from "react-icons/fa";

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

  const handleTogglePacked = () => {
    onUpdate(item.id, { is_packed: !item.is_packed });
  };

  if (isEditing) {
    return (
      <div className={`packing-item editing ${item.is_packed ? "packed" : ""}`}>
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
        <div className="item-actions">
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
        </div>
      </div>
    );
  }

  return (
    <div className={`packing-item ${item.is_packed ? "packed" : ""}`}>
      <div className="item-checkbox" onClick={handleTogglePacked}>
        {item.is_packed ? (
          <FaCheck className="checked" />
        ) : (
          <div className="unchecked" />
        )}
      </div>
      <span className="item-name">{item.name}</span>
      {/* <span className="item-category">{item.category}</span> */}
      {/* <span className="item-day">Day {item.day}</span> */}
      <div className="item-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="icon-button"
          aria-label="Edit"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="icon-button"
          aria-label="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default PackingItem;
