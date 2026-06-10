
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
  favoriteGenres: string[];
  savedMovies: string[];
}

interface UserState {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  saveMovie: (title: string) => void;
  unsaveMovie: (title: string) => void;
  isMovieSaved: (title: string) => boolean;
  updateFavoriteGenres: (genres: string[]) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (email, name) =>
        set({
          user: {
            email,
            name: name || email.split('@')[0],
            favoriteGenres: [],
            savedMovies: [],
          },
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
      updateFavoriteGenres: (genres) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, favoriteGenres: genres } });
        }
      },
    }),
    {
      name: 'cinematch-user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useUser = useUserStore;
