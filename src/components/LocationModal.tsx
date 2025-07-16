import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    country_name: string;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
}

export const LocationModal = ({ isOpen, onClose, position, onSubmit }: LocationModalProps) => {
  const [formData, setFormData] = useState({
    twitter_username: '',
    comment: '',
    country_name: ''
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
        comment: '',
        country_name: ''
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
      comment: '',
      country_name: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-map-glass backdrop-blur-lg border-map-glass-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-primary">
            Pin Your Location
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter_username" className="text-sm font-medium text-muted-foreground">
              Your X (Twitter) Username
            </Label>
            <Input
              id="twitter_username"
              type="text"
              value={formData.twitter_username}
              onChange={(e) => setFormData(prev => ({ ...prev, twitter_username: e.target.value }))}
              placeholder="e.g., 0xcrashout"
              required
              className="bg-map-surface border-map-border focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country_name" className="text-sm font-medium text-muted-foreground">
              Country/City
            </Label>
            <Input
              id="country_name"
              type="text"
              value={formData.country_name}
              onChange={(e) => setFormData(prev => ({ ...prev, country_name: e.target.value }))}
              placeholder="e.g., Istanbul, Turkey"
              required
              className="bg-map-surface border-map-border focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium text-muted-foreground">
              Your Note
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="e.g., Greetings from Istanbul!"
              required
              rows={3}
              className="bg-map-surface border-map-border focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
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