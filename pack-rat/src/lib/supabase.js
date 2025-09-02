import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to fetch trips for the current user
export const fetchTrips = async (userId = null) => {
  try {
    let query = supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });

    // If userId is provided, filter by that user
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
};

// Helper function to add a new trip
export const addTrip = async (tripData, userId) => {
  try {
    const { data, error } = await supabase
      .from("trips")
      .insert([
        {
          trip_name: tripData.tripName.toLowerCase(),
          origin: tripData.origin.toLowerCase(),
          destination: tripData.destination.toLowerCase(),
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          packing_days: tripData.packingDays,
          notes: tripData.notes.toLowerCase(),
          user_id: userId, // Add the user's UID to the trip
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error("Error adding trip:", error);
    throw error;
  }
};

// Helper function to delete a trip
export const deleteTrip = async (tripId) => {
  try {
    const { error } = await supabase.from("trips").delete().eq("id", tripId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting trip:", error);
    throw error;
  }
};
