import { createClient } from '@supabase/supabase-js';


export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to fetch all trips
export const fetchTrips = async () => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
};

// Helper function to add a new trip
export const addTrip = async (tripData) => {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([{
        trip_name: tripData.tripName,
        origin: tripData.origin,
        destination: tripData.destination,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        packing_days: tripData.packingDays,
        notes: tripData.notes
      }])
      .select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    console.error('Error adding trip:', error);
    throw error;
  }
};

// Helper function to delete a trip
export const deleteTrip = async (tripId) => {
  try {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};
