import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash } from "react-icons/fa";
import PackingList from "./PackingList";
import { supabase } from "../../lib/supabase";
import "./DaySection.css";

const DaySection = ({ day, tripId, totalDays, onAddEvent }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddEvent) {
      onAddEvent();
    }
  };

  const handleDeleteDay = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (
      !window.confirm(
        `Are you sure you want to delete Day ${day}? This will remove all events and items for this day, and shift all subsequent days up by one.`
      )
    ) {
      return;
    }

    try {
      // First delete all items and event instances for this day
      const [{ error: itemsError }, { error: eventsDeleteError }] = await Promise.all([
        supabase
          .from("packing_items")
          .delete()
          .eq("trip_id", tripId)
          .eq("day", day),
        supabase
          .from("event_instances")
          .delete()
          .eq("trip_id", tripId)
          .eq("day", day)
      ]);
      
      if (itemsError) throw itemsError;
      if (eventsDeleteError) console.warn("Error deleting event instances:", eventsDeleteError);

      // Get current trip data
      const { data: tripData, error: tripError } = await supabase
        .from("trips")
        .select("packing_days")
        .eq("id", tripId)
        .single();

      if (tripError) throw tripError;

      // If this is the last day, don't allow deletion
      // if (tripData.packing_days <= 1) {
      //   throw new Error("Cannot delete the only remaining day");
      // }

      // Update all items and events for days after the deleted day
      const { data: itemsToUpdate, error: fetchError } = await supabase
        .from("packing_items")
        .select("id, day")
        .eq("trip_id", tripId)
        .gt("day", day);

      if (fetchError) throw fetchError;

      // Update each item to shift its day number down by 1
      const updatePromises = itemsToUpdate.map((item) =>
        supabase
          .from("packing_items")
          .update({ day: item.day - 1 })
          .eq("id", item.id)
      );

      // Update event_instances for subsequent days
      try {
        const { data: eventsToUpdate, error: eventsError } = await supabase
          .from("event_instances")
          .select("id, day")
          .eq("trip_id", tripId)
          .gt("day", day);

        if (eventsError) {
          console.warn("Error fetching event instances:", eventsError);
        } else if (eventsToUpdate && eventsToUpdate.length > 0) {
          const eventUpdatePromises = eventsToUpdate.map((event) =>
            supabase
              .from("event_instances")
              .update({ day: event.day - 1 })
              .eq("id", event.id)
          );
          updatePromises.push(...eventUpdatePromises);
        }
      } catch (eventsError) {
        console.warn("Error updating event instances:", eventsError);
        // Don't fail the entire operation if event instances update fails
      }

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Finally, decrement the packing_days count
      const { error: updateError } = await supabase
        .from("trips")
        .update({ packing_days: tripData.packing_days - 1 })
        .eq("id", tripId);

      if (updateError) throw updateError;

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error deleting day:", error);
      alert(`Failed to delete day: ${error.message}`);
    }
  };

  return (
    <div className="day-section" style={{ position: "relative" }}>
      <div className="day-header">
        <h3>Day {day}</h3>
        <div className="day-actions">
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleAddClick}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            disabled={isAdding}
          >
            <FaPlus /> {isAdding ? "Adding..." : "Add Event"}
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleDeleteDay}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <FaTrash /> Delete Day
          </button>
        </div>
      </div>

      <PackingList tripId={tripId} day={day} totalDays={totalDays} />
    </div>
  );
};

export default DaySection;
