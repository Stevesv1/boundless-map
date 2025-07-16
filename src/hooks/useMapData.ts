import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserNote } from '@/types/map';
import { useToast } from '@/hooks/use-toast';

export const useMapData = () => {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const { data: notesData, error: notesError } = await supabase
        .from('user_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;

      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    // Set up real-time subscriptions for notes only
    const notesSubscription = supabase
      .channel('user_notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notes' }, () => {
        fetchNotes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notesSubscription);
    };
  }, []);

  const addNote = async (data: {
    twitter_username: string;
    comment: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .insert([{
          twitter_username: data.twitter_username,
          comment: data.comment,
          latitude: data.latitude,
          longitude: data.longitude
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your location has been pinned!'
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add location',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    notes,
    loading,
    addNote
  };
};