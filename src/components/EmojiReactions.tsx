import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CommentReaction } from '@/types/map';

interface EmojiReactionsProps {
  commentId: string;
  reactions: CommentReaction[];
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😍', '🎉', '🔥', '👏', '💯', '🚀'];

export const EmojiReactions = ({ 
  commentId, 
  reactions, 
  onAddReaction, 
  onRemoveReaction 
}: EmojiReactionsProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Group reactions by emoji and count them
  const reactionCounts = reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleEmojiClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    
    if (existingReaction) {
      onRemoveReaction(commentId, emoji);
    } else {
      onAddReaction(commentId, emoji);
    }
    
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Display existing reactions */}
      {Object.entries(reactionCounts).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="secondary"
          size="sm"
          onClick={() => handleEmojiClick(emoji)}
          className="h-7 px-2 py-1 text-xs bg-map-surface hover:bg-map-surface-hover border-map-border"
        >
          {emoji} {count}
        </Button>
      ))}

      {/* Add reaction button */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 py-1 text-xs bg-map-surface hover:bg-map-surface-hover border-map-border"
          >
            + 😊
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2 bg-map-glass backdrop-blur-lg border-map-glass-border"
          align="start"
        >
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleEmojiClick(emoji)}
                className="h-8 w-8 p-0 hover:bg-map-surface-hover"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};