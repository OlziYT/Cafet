// Types pour les données brutes de Supabase
export interface RawMenuItem {
  id: string;
  name: string;
  date: string;
  image_url: string;
  price: string | number;
}

export interface RawProfile {
  id: string;
  name: string;
  email: string;
}

// Type pour les données brutes de Supabase
export interface RawReservationData {
  id: string;
  created_at: string;
  picked_up: boolean;
  status: string;
  user_id: string;
  menu_item_id: string;
  profiles: RawProfile[];  // Tableau car Supabase retourne toujours un tableau
  menu_items: RawMenuItem[];  // Tableau car Supabase retourne toujours un tableau
}

export interface RawUserReservationData {
  id: string;
  created_at: string;
  picked_up: boolean;
  menu_item: RawMenuItem[];  // Tableau car Supabase retourne toujours un tableau
}

// Types pour les données transformées
export interface MenuItem {
  id: string;
  name: string;
  date: string;
  image_url: string;
  price: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface UserReservation {
  id: string;
  created_at: string;
  picked_up: boolean;
  menu_item: MenuItem;
}

export interface AdminReservation {
  id: string;
  created_at: string;
  picked_up: boolean;
  status: string;
  user_id: string;
  menu_item_id: string;
  user: UserProfile;
  menu_item: MenuItem;
}
