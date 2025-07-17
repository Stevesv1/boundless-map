import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { lat: number; lng: number } | null;
  onSubmit: (data: {
    twitter_username: string;
    comment: string;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
}

export const LocationModal = ({ isOpen, onClose, position, onSubmit }: LocationModalProps) => {
  const [formData, setFormData] = useState({
    twitter_username: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        latitude: position.lat,
        longitude: position.lng
      });
      
      // Reset form
      setFormData({
        twitter_username: '',
        comment: ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      twitter_username: '',
      comment: ''
    });
    onClose();
  };

  console.log('LocationModal render:', { isOpen, position });
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md bg-map-glass backdrop-blur-lg border-map-glass-border z-[9999] mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-center text-primary">
            Pin Your Location
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Share your location and add a note to the map
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter_username" className="text-sm font-medium text-muted-foreground block">
              Your X Username
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="twitter_username"
                type="text"
                value={formData.twitter_username}
                onChange={(e) => setFormData(prev => ({ ...prev, twitter_username: e.target.value }))}
                placeholder="e.g., Zun2025"
                required
                className="bg-map-surface border-map-border focus:ring-primary focus:border-primary min-h-[44px]"
              />
              {formData.twitter_username && (
                <img
                  src={`https://unavatar.io/x/${formData.twitter_username}`}
                  alt={formData.twitter_username}
                  className="w-8 h-8 rounded-full border-2 border-primary bg-background flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = '/Boundless_Logo white.png';
                  }}
                />
              )}
            </div>
          </div>

          {/* Removed Country/City input */}

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium text-muted-foreground block">
              Your Comment
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="e.g., gBerry 🍓🍓"
              required
              rows={3}
              className="bg-map-surface border-map-border focus:ring-primary focus:border-primary resize-none min-h-[44px]"
            />
          </div>

          <div className="flex gap-3 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1 min-h-[44px]"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 min-h-[44px]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
