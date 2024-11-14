import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

const defaultUsers: User[] = [
  {
    id: 1,
    email: 'admin@kafet.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },
  {
    id: 2,
    email: 'user@kafet.com',
    password: 'user123',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user'
  }
];

interface AuthState {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (user: Omit<User, 'id' | 'role'>) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      users: defaultUsers,
      login: (email: string, password: string) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) {
          set({ user });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null }),
      register: (newUser) => {
        const { users } = get();
        if (users.some(u => u.email === newUser.email)) {
          return false;
        }
        const user: User = {
          ...newUser,
          id: users.length + 1,
          role: 'user'
        };
        set(state => ({ users: [...state.users, user] }));
        return true;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ users: state.users })
    }
  )
);