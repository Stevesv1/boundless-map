import { useState, useEffect } from 'react';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LocationModal } from '@/components/LocationModal';
import { Button } from '@/components/ui/button';
import { useMapData } from '@/hooks/useMapData';

const Index = () => {
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    position: null
  });

  const { notes, loading, addNote } = useMapData();

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingMode) {
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
    latitude: number;
    longitude: number;
  }) => {
    await addNote(data);
    setIsAddingMode(false);
  };

  const toggleAddingMode = () => {
    setIsAddingMode(!isAddingMode);
  };

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
      <div className="absolute top-4 sm:top-5 left-1/2 transform -translate-x-1/2 z-[1000] w-full flex justify-center px-2">
        <div
          className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maxWidth: 'min(98vw, 600px)',
            width: '100%',
          }}
        >
          <img
            src="/Boundless_Logo white.png"
            alt="Boundless Logo"
            className="w-12 h-9 sm:w-16 sm:h-12 drop-shadow-lg flex-shrink-0 object-contain"
          />
          <span className="text-sm sm:text-lg font-semibold text-white drop-shadow-sm whitespace-nowrap text-center" style={{lineHeight: 1.2}}>
            Write about Boundless on World Map
          </span>
        </div>
      </div>

      {/* Main Map */}
      <InteractiveMap
        comments={notes}
        onMapClick={handleMapClick}
        isAddingMode={isAddingMode}
      />

      {/* Add Location Button */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-[1000]">
        <Button
          variant="map-primary"
          size="lg"
          onClick={toggleAddingMode}
          className={`font-bold py-3 px-4 sm:px-6 rounded-full min-h-[44px] ${
            isAddingMode ? 'w-64 sm:w-72' : ''
          } transition-all duration-300 text-sm sm:text-base`}
        >
          {isAddingMode ? 'Click on the map to select a location' : 'Pin on Map'}
        </Button>
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
