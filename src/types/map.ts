export interface UserNote {
  id: string;
  twitter_username: string;
  comment: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  emoji: string;
  user_identifier: string;
  created_at: string;
}

export interface NoteWithReactions extends UserNote {
  reactions: CommentReaction[];
}

export interface LocationFormData {
  twitter_username: string;
  comment: string;
  country_name: string;
  latitude: number;
  longitude: number;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
}

export interface LocationModalState {
  isOpen: boolean;
  position: { lat: number; lng: number } | null;
}