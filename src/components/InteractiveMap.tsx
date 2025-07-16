import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UserNote } from '@/types/map';
import { formatDistanceToNow } from 'date-fns';


interface InteractiveMapProps {
  comments: UserNote[];
  onMapClick: (lat: number, lng: number) => void;
  isAddingMode: boolean;
}

export const InteractiveMap = ({ 
  comments, 
  onMapClick, 
  isAddingMode,
}: InteractiveMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Remove isClusterView and clusterGroupRef
  // const [isClusterView, setIsClusterView] = useState(false);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  // const clusterGroupRef = useRef<any>(null);

  // React popup state
  const [activeComment, setActiveComment] = useState<UserNote | null>(null);
  const [popupPosition, setPopupPosition] = useState<{x: number, y: number} | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2.5,
      minZoom: 2.5,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
      zoomControl: false
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: 'Made with ❤️ by <a href="https://x.com/Zun2025" target="_blank">Zun</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Remove cluster group initialization
    // clusterGroupRef.current = new (L as any).MarkerClusterGroup({ ... });

    // Only add markers layer
    map.addLayer(markersRef.current);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle map clicks - separate effect to capture current isAddingMode
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      console.log('Map clicked, isAddingMode:', isAddingMode, 'position:', e.latlng);
      if (isAddingMode) {
        e.originalEvent?.preventDefault();
        e.originalEvent?.stopPropagation();
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    };

    mapRef.current.on('click', handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, [isAddingMode, onMapClick]);

  // Update cursor when adding mode changes
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = isAddingMode ? 'crosshair' : 'grab';
    }
  }, [isAddingMode]);

  // Update markers when comments change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove markers layer from map (if present)
    if (mapRef.current.hasLayer(markersRef.current)) {
      mapRef.current.removeLayer(markersRef.current);
    }
    // Clear markers
    markersRef.current.clearLayers();

    comments.forEach((comment) => {
      if (comment.latitude && comment.longitude) {
        const icon = L.divIcon({
          html: `<div class="avatar-marker-container"><img class="w-10 h-10 rounded-full border-2 border-pink-500 shadow-lg hover:scale-110 transition-transform" 
                      src="https://unavatar.io/x/${comment.twitter_username}" 
                      alt="${comment.twitter_username}" 
                      onerror="this.src='/Boundless_Logo white.png';" /></div>`,
          className: 'avatar-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, 0]
        });

        const marker = L.marker([comment.latitude, comment.longitude], { icon });

        // On marker click, set active comment and popup position
        marker.on('click', (e) => {
          setActiveComment(comment);
          if (mapRef.current) {
            const point = mapRef.current.latLngToContainerPoint([comment.latitude, comment.longitude]);
            setPopupPosition({ x: point.x, y: point.y });
          }
        });

        // REMOVE: Leaflet popup creation and popupopen logic
        // We'll handle popups in React

        markersRef.current.addLayer(marker);
      }
    });

    // Add markers layer back to map
    mapRef.current.addLayer(markersRef.current);
  }, [comments]);

  // Add global functions for popup interactions
  useEffect(() => {
    return () => {
    };
  }, []);

  // Close popup on map click
  useEffect(() => {
    if (!mapRef.current) return;
    const closePopup = () => {
      setActiveComment(null);
      setPopupPosition(null);
    };
    mapRef.current.on('click', closePopup);
    return () => {
      mapRef.current?.off('click', closePopup);
    };
  }, []);

  // Add effect to update popup position on map move/zoom/resize
  useEffect(() => {
    if (!activeComment || !mapRef.current) return;
    const updatePopupPosition = () => {
      const point = mapRef.current!.latLngToContainerPoint([activeComment.latitude, activeComment.longitude]);
      setPopupPosition({ x: point.x, y: point.y });
    };
    mapRef.current.on('move zoom', updatePopupPosition);
    window.addEventListener('resize', updatePopupPosition);
    updatePopupPosition();
    return () => {
      mapRef.current?.off('move', updatePopupPosition);
      mapRef.current?.off('zoom', updatePopupPosition);
      window.removeEventListener('resize', updatePopupPosition);
    };
  }, [activeComment]);

  // Helper to determine popup direction based on available space
  function getPopupTransform(x: number, y: number) {
    if (!mapContainerRef.current) return 'translate(-50%, -100%)';
    const mapRect = mapContainerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 768;
    const popupHeight = isMobile ? 180 : 220; // smaller on mobile
    const popupWidth = isMobile ? 280 : 340;
    // If not enough space above, show below
    if (y - popupHeight < 0) return 'translate(-50%, 10px)';
    // If not enough space to the right, show left
    if (x + popupWidth/2 > mapRect.width) return 'translate(-100%, -50%)';
    // If not enough space to the left, show right
    if (x - popupWidth/2 < 0) return 'translate(0, -50%)';
    // Default: above
    return 'translate(-50%, -100%)';
  }

  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', inset: 0, zIndex: 0}}>
      <div ref={mapContainerRef} style={{width: '100vw', height: '100vh', background: 'var(--map-bg)'}} />
      {activeComment && popupPosition && (
        <div
          className="custom-popup"
          style={{
            position: 'absolute',
            left: popupPosition.x,
            top: popupPosition.y,
            transform: getPopupTransform(popupPosition.x, popupPosition.y) + ' scale(1)',
            zIndex: 2000,
            opacity: 1,
            transition: 'opacity 0.3s, transform 0.3s',
            background: 'rgba(34, 38, 54, 0.98)',
            borderRadius: 22,
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.35), 0 0 18px 3px #ff6ec4',
            minWidth: 260,
            maxWidth: 360,
            color: '#fff',
            padding: '28px 24px 20px 24px',
            border: '2.5px solid #ff6ec4',
            fontFamily: 'Lexend, system-ui, sans-serif',
          }}
        >
          <button onClick={() => { setActiveComment(null); setPopupPosition(null); }} style={{position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#ff6ec4', fontSize: 24, cursor: 'pointer', zIndex: 10, lineHeight: 1}}>&times;</button>
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={`https://unavatar.io/x/${activeComment.twitter_username}`}
              className="w-10 h-10 rounded-full border-2 border-pink-500 shadow-lg bg-white cursor-pointer hover:scale-110 transition-transform"
              alt={activeComment.twitter_username}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/Boundless_Logo white.png'; }}
              onClick={() => window.open(`https://x.com/${activeComment.twitter_username}`, '_blank')}
            />
            <div>
              <h4 
                className="font-bold text-lg bg-gradient-to-r from-pink-400 to-fuchsia-500 text-transparent bg-clip-text cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(`https://x.com/${activeComment.twitter_username}`, '_blank')}
              >
                @{activeComment.twitter_username}
              </h4>
              <p className="text-xs text-gray-400 popup-time">{formatDistanceToNow(new Date(activeComment.created_at), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="popup-comment-card">
            <div className="popup-comment-text">{activeComment.comment}</div>
          </div>
          {/* You can add reactions here if needed */}
        </div>
      )}
    </div>
  );
};
