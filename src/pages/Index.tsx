import { useState, useEffect } from 'react';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LocationModal } from '@/components/LocationModal';
import { RecentNotesFeed } from '@/components/RecentNotesFeed';
import { Button } from '@/components/ui/button';
import { useMapData } from '@/hooks/useMapData';
import { LocationModalState } from '@/types/map';

const Index = () => {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [modalState, setModalState] = useState<LocationModalState>({
    isOpen: false,
    position: null
  });
  
  console.log('Index render:', { isAddingMode, modalState });
  
  const { comments, loading, addComment, addReaction, removeReaction } = useMapData();

  const handleMapClick = (lat: number, lng: number) => {
    console.log('handleMapClick called:', { lat, lng, isAddingMode });
    if (isAddingMode) {
      console.log('Setting modal state to open');
      setModalState({
        isOpen: true,
        position: { lat, lng }
      });
    }
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      position: null
    });
    setIsAddingMode(false);
  };

  const handleAddLocation = async (data: {
    twitter_username: string;
    comment: string;
    country_name: string;
    latitude: number;
    longitude: number;
  }) => {
    await addComment(data);
    setIsAddingMode(false);
  };

  const toggleAddingMode = () => {
    setIsAddingMode(!isAddingMode);
  };

  // Set dark mode on body
  useEffect(() => {
    document.body.classList.add('dark');
    document.documentElement.classList.add('dark');
    return () => {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Succinct Logo */}
      <div className="absolute top-5 left-5 z-[1000]">
        <img 
          src="https://testnet.succinct.xyz/images/succinct-icon-pink.svg" 
          alt="Succinct Logo" 
          className="w-12 h-12 drop-shadow-lg" 
        />
      </div>

      {/* Main Map */}
      <InteractiveMap
        comments={comments}
        onMapClick={handleMapClick}
        isAddingMode={isAddingMode}
        onAddReaction={addReaction}
        onRemoveReaction={removeReaction}
      />

      {/* Add Location Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[1000]">
        <Button
          variant="map-primary"
          size="lg"
          onClick={toggleAddingMode}
          className={`font-bold py-3 px-6 rounded-full ${
            isAddingMode ? 'w-72' : ''
          } transition-all duration-300`}
        >
          {isAddingMode ? 'Click on the map to select a location' : 'Pin on Map'}
        </Button>
      </div>

      {/* Recent Notes Feed */}
      <div className="fixed bottom-8 left-5 z-[1000] hidden md:block">
        <RecentNotesFeed
          comments={comments}
          onAddReaction={addReaction}
          onRemoveReaction={removeReaction}
        />
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        position={modalState.position}
        onSubmit={handleAddLocation}
      />
    </div>
  );
};

export default Index;
