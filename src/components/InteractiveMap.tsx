import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CommentWithReactions } from '@/types/map';
import { EmojiReactions } from './EmojiReactions';
import { formatDistanceToNow } from 'date-fns';

// Import marker cluster if available
let MarkerClusterGroup: any;
try {
  MarkerClusterGroup = require('leaflet.markercluster');
} catch (e) {
  console.log('Marker cluster not available');
}

interface InteractiveMapProps {
  comments: CommentWithReactions[];
  onMapClick: (lat: number, lng: number) => void;
  isAddingMode: boolean;
  onAddReaction: (commentId: string, emoji: string) => void;
  onRemoveReaction: (commentId: string, emoji: string) => void;
}

export const InteractiveMap = ({ 
  comments, 
  onMapClick, 
  isAddingMode,
  onAddReaction,
  onRemoveReaction
}: InteractiveMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isClusterView, setIsClusterView] = useState(false);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const clusterGroupRef = useRef<any>(null);

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
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Initialize cluster group if available
    if (MarkerClusterGroup) {
      clusterGroupRef.current = new MarkerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
          return L.divIcon({
            html: `<div><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: L.point(40, 40)
          });
        }
      });
    }

    // Add initial layer to map
    if (isClusterView && clusterGroupRef.current) {
      map.addLayer(clusterGroupRef.current);
    } else {
      map.addLayer(markersRef.current);
    }

    // Handle map clicks
    map.on('click', (e) => {
      if (isAddingMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update cursor when adding mode changes
  useEffect(() => {
    if (mapContainerRef.current) {
      mapContainerRef.current.style.cursor = isAddingMode ? 'crosshair' : 'grab';
    }
  }, [isAddingMode]);

  // Update markers when comments change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();
    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers();
    }

    comments.forEach((comment) => {
      if (comment.latitude && comment.longitude) {
        const icon = L.divIcon({
          html: `<img class="w-10 h-10 rounded-full border-2 border-pink-500 shadow-lg hover:scale-110 transition-transform" 
                      src="https://unavatar.io/x/${comment.twitter_username}" 
                      alt="${comment.twitter_username}" 
                      onerror="this.src='https://testnet.succinct.xyz/images/succinct-icon-pink.svg';" />`,
          className: 'avatar-marker',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20]
        });

        const marker = L.marker([comment.latitude, comment.longitude], { icon });

        // Create popup content with React component
        const popupContent = document.createElement('div');
        popupContent.className = 'p-3 min-w-64';
        popupContent.innerHTML = `
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <img src="https://unavatar.io/x/${comment.twitter_username}" 
                   class="w-8 h-8 rounded-full border-2 border-pink-500" 
                   alt="${comment.twitter_username}"
                   onerror="this.src='https://testnet.succinct.xyz/images/succinct-icon-pink.svg';" />
              <div>
                <h4 class="font-bold text-pink-400 text-lg">@${comment.twitter_username}</h4>
                <p class="text-xs text-gray-400">${formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</p>
              </div>
            </div>
            <p class="text-gray-300 leading-relaxed">${comment.comment}</p>
            <p class="text-xs text-gray-400">📍 ${comment.country_name}</p>
            <div id="reactions-${comment.id}"></div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'custom-popup',
          maxWidth: 300,
          closeButton: true
        });

        // Add event listener for when popup opens to render reactions
        marker.on('popupopen', () => {
          const reactionsContainer = document.getElementById(`reactions-${comment.id}`);
          if (reactionsContainer) {
            // Group reactions by emoji
            const reactionCounts = comment.reactions.reduce((acc, reaction) => {
              acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            // Create reaction buttons
            const reactionsHTML = Object.entries(reactionCounts)
              .map(([emoji, count]) => 
                `<button class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600 mr-1 mb-1" 
                         onclick="window.toggleReaction('${comment.id}', '${emoji}')">
                   ${emoji} ${count}
                 </button>`
              ).join('');

            reactionsContainer.innerHTML = `
              <div class="flex flex-wrap gap-1">
                ${reactionsHTML}
                <button class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 border border-gray-600" 
                        onclick="window.showEmojiPicker('${comment.id}')">
                  + 😊
                </button>
              </div>
            `;
          }
        });

        // Add marker to appropriate layer
        markersRef.current.addLayer(marker);
        if (clusterGroupRef.current) {
          clusterGroupRef.current.addLayer(marker);
        }
      }
    });
  }, [comments]);

  // Add global functions for popup interactions
  useEffect(() => {
    (window as any).toggleReaction = (commentId: string, emoji: string) => {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        const existingReaction = comment.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          onRemoveReaction(commentId, emoji);
        } else {
          onAddReaction(commentId, emoji);
        }
      }
    };

    (window as any).showEmojiPicker = (commentId: string) => {
      const emojis = ['👍', '❤️', '😍', '🎉', '🔥', '👏', '💯', '🚀'];
      const emojiButtons = emojis.map(emoji => 
        `<button class="text-lg p-2 hover:bg-gray-700 rounded" onclick="window.addReaction('${commentId}', '${emoji}')">${emoji}</button>`
      ).join('');
      
      const picker = document.createElement('div');
      picker.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]';
      picker.innerHTML = `
        <div class="bg-gray-800 p-4 rounded-lg border border-gray-600">
          <div class="grid grid-cols-4 gap-2 mb-4">
            ${emojiButtons}
          </div>
          <button class="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white" onclick="this.parentElement.parentElement.remove()">
            Cancel
          </button>
        </div>
      `;
      document.body.appendChild(picker);
    };

    (window as any).addReaction = (commentId: string, emoji: string) => {
      onAddReaction(commentId, emoji);
      // Close picker
      const picker = document.querySelector('.fixed.inset-0');
      if (picker) picker.remove();
    };

    return () => {
      delete (window as any).toggleReaction;
      delete (window as any).showEmojiPicker;
      delete (window as any).addReaction;
    };
  }, [comments, onAddReaction, onRemoveReaction]);

  const toggleView = () => {
    if (!mapRef.current) return;

    const newClusterView = !isClusterView;
    setIsClusterView(newClusterView);

    if (newClusterView && clusterGroupRef.current) {
      mapRef.current.removeLayer(markersRef.current);
      mapRef.current.addLayer(clusterGroupRef.current);
    } else {
      if (clusterGroupRef.current) {
        mapRef.current.removeLayer(clusterGroupRef.current);
      }
      mapRef.current.addLayer(markersRef.current);
    }
  };

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainerRef} className="h-full w-full bg-map-bg" />
      
      {/* View Toggle */}
      <div className="absolute top-4 right-4 z-[1000] bg-map-glass backdrop-blur-sm border border-map-glass-border p-3 rounded-lg flex items-center space-x-3 text-sm">
        <span className="text-foreground">Avatar View</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isClusterView}
            onChange={toggleView}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-map-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
        <span className="text-foreground">Cluster View</span>
      </div>
    </div>
  );
};