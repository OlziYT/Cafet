export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type DietaryTag = 'gluten-free' | 'vegan' | 'vegetarian' | 'organic';

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  date: string;
  quota: number;
  reservations: number;
  dietaryTags: DietaryTag[];
};

export type Reservation = {
  id: string;
  userId: string;
  menuItemId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
};