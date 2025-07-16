import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserComment, CommentReaction, CommentWithReactions } from '@/types/map';
import { useToast } from '@/hooks/use-toast';

export const useMapData = () => {
  const [comments, setComments] = useState<CommentWithReactions[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('user_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      const { data: reactionsData, error: reactionsError } = await supabase
        .from('comment_reactions')
        .select('*');

      if (reactionsError) throw reactionsError;

      // Group reactions by comment_id
      const reactionsByComment = reactionsData.reduce((acc, reaction) => {
        if (!acc[reaction.comment_id]) {
          acc[reaction.comment_id] = [];
        }
        acc[reaction.comment_id].push(reaction);
        return acc;
      }, {} as Record<string, CommentReaction[]>);

      // Combine comments with reactions
      const commentsWithReactions = commentsData.map(comment => ({
        ...comment,
        reactions: reactionsByComment[comment.id] || []
      }));

      setComments(commentsWithReactions);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();

    // Set up real-time subscriptions
    const commentsSubscription = supabase
      .channel('user_comments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_comments' }, () => {
        fetchComments();
      })
      .subscribe();

    const reactionsSubscription = supabase
      .channel('comment_reactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_reactions' }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(reactionsSubscription);
    };
  }, []);

  const addComment = async (data: {
    twitter_username: string;
    comment: string;
    country_name: string;
    latitude: number;
    longitude: number;
  }) => {
    try {
      const { error } = await supabase
        .from('user_comments')
        .insert([{
          twitter_username: data.twitter_username,
          comment: data.comment,
          country_name: data.country_name,
          country_code: 'XX', // Default country code
          latitude: data.latitude,
          longitude: data.longitude
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your location has been pinned!'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add location',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const addReaction = async (commentId: string, emoji: string) => {
    try {
      const userIdentifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('comment_reactions')
        .insert([{
          comment_id: commentId,
          emoji,
          user_identifier: userIdentifier
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive'
      });
    }
  };

  const removeReaction = async (commentId: string, emoji: string) => {
    try {
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', commentId)
        .eq('emoji', emoji);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove reaction',
        variant: 'destructive'
      });
    }
  };

  return {
    comments,
    loading,
    addComment,
    addReaction,
    removeReaction
  };
};