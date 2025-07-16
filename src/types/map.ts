export interface UserComment {
  id: string;
  comment: string;
  country_code: string;
  country_name: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
  twitter_display_name: string | null;
  twitter_profile_pic: string | null;
  twitter_username: string;
  updated_at: string;
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  emoji: string;
  user_identifier: string;
  created_at: string;
}

export interface CommentWithReactions extends UserComment {
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