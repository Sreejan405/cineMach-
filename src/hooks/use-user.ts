
"use client";

import { create } from 'zustand';

interface User {
  email: string;
  favoriteGenres: string[];
  savedMovies: string[];
}

interface UserState {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  saveMovie: (title: string) => void;
  unsaveMovie: (title: string) => void;
  isMovieSaved: (title: string) => boolean;
}

const useUserStore = create<UserState>((set, get) => ({
  user: null,
  login: (email) => set({ 
    user: { 
      email,
      favoriteGenres: [],
      savedMovies: [],
    } 
  }),
  logout: () => set({ user: null }),
  saveMovie: (title) => {
    const { user } = get();
    if (user && !user.savedMovies.includes(title)) {
      set({
        user: {
          ...user,
          savedMovies: [...user.savedMovies, title],
        },
      });
    }
  },
  unsaveMovie: (title) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          savedMovies: user.savedMovies.filter((movie) => movie !== title),
        },
      });
    }
  },
  isMovieSaved: (title) => {
    const { user } = get();
    return user ? user.savedMovies.includes(title) : false;
  },
}));

export const useUser = useUserStore;
