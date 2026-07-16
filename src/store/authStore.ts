import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'superadmin' | 'manager' | 'support' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password: string;
}

interface AuthState {
  currentUser: Omit<User, 'password'> | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
}

const DEMO_USERS: User[] = [
  { id: '1', name: 'Super Admin', email: 'admin@stay.com', password: 'admin123', role: 'superadmin' },
  { id: '2', name: 'Manager',     email: 'manager@stay.com', password: 'manager123', role: 'manager' },
  { id: '3', name: 'Support Agent', email: 'support@stay.com', password: 'support123', role: 'support' },
  { id: '4', name: 'Ahmad Alhalabi', email: 'user@stay.com', password: 'user123', role: 'user' },
];

// debug: لتسهيل كشف مشكلة تسجيل الدخول للـ support
// console.log('DEMO_USERS', DEMO_USERS);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: DEMO_USERS,
      isAuthenticated: false,

      login: (email, password) => {
        const all = get().users;
        const found = all.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) return { success: false, message: 'Invalid email or password.' };
        const { password: _pw, ...safe } = found;
        set({ currentUser: safe, isAuthenticated: true });
        return { success: true, message: 'Welcome back!' };
      },

      signup: (name, email, password) => {
        const all = get().users;
        if (all.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
          return { success: false, message: 'Email already registered.' };
        }
        const newUser: User = {
          id: Date.now().toString(),
          name,
          email,
          password,
          role: 'user',
        };
        set((s) => ({ users: [...s.users, newUser] }));
        const { password: _pw, ...safe } = newUser;
        set({ currentUser: safe, isAuthenticated: true });
        return { success: true, message: 'Account created successfully!' };
      },

      logout: () => set({ currentUser: null, isAuthenticated: false }),
    }),
    { name: 'stay-auth' }
  )
);
