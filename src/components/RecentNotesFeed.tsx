import { CommentWithReactions } from '@/types/map';
import { EmojiReactions } from './EmojiReactions';
import { formatDistanceToNow } from 'date-fns';

interface RecentNotesFeedProps {
  comments: CommentWithReactions[];
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
}

export const RecentNotesFeed = ({ 
  comments, 
  onAddReaction, 
  onRemoveReaction 
}: RecentNotesFeedProps) => {
  const recentComments = comments.slice(0, 5);

  if (recentComments.length === 0) {
    return (
      <div className="bg-map-glass backdrop-blur-lg border border-map-glass-border p-4 rounded-xl w-72 max-h-80 overflow-y-auto">
        <h4 className="font-bold text-center mb-3 text-foreground">Recent Notes</h4>
        <p className="text-muted-foreground text-center text-sm py-2">
          No notes yet. Be the first to pin your location!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-map-glass backdrop-blur-lg border border-map-glass-border p-4 rounded-xl w-72 max-h-80 overflow-y-auto">
      <h4 className="font-bold text-center mb-3 text-foreground">Recent Notes</h4>
      <div className="space-y-3">
        {recentComments.map((comment) => (
          <div key={comment.id} className="bg-map-surface/30 rounded-lg p-3 border border-map-border">
            <div className="flex items-center mb-2">
              <img
                src={`https://unavatar.io/x/${comment.twitter_username}`}
                className="w-6 h-6 rounded-full mr-2 border-2 border-primary"
                alt={comment.twitter_username}
                onError={(e) => {
                  e.currentTarget.src = 'https://testnet.succinct.xyz/images/succinct-icon-pink.svg';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary text-sm truncate">
                  @{comment.twitter_username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              "{comment.comment}"
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              📍 {comment.country_name}
            </p>
            <EmojiReactions
              commentId={comment.id}
              reactions={comment.reactions}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
            />
          </div>
        ))}
      </div>
    </div>
  );
};