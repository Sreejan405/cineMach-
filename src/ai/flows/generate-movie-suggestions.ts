
'use server';

import { discoverMovies, Movie } from '@/services/tmdb';

const genreMap: { [key: string]: number } = {
    "Action": 28,
    "Adventure": 12,
    "Animation": 16,
    "Comedy": 35,
    "Crime": 80,
    "Documentary": 99,
    "Drama": 18,
    "Family": 10751,
    "Fantasy": 14,
    "History": 36,
    "Horror": 27,
    "Music": 10402,
    "Mystery": 9648,
    "Romance": 10749,
    "Science Fiction": 878,
    "TV Movie": 10770,
    "Thriller": 53,
    "War": 10752,
    "Western": 37,
};

export interface GenerateMovieSuggestionsInput {
  genres: (keyof typeof genreMap | 'Tragedy')[];
  language?: string;
  startDate?: string;
  endDate?: string;
}

export interface GenerateMovieSuggestionsOutput {
  suggestions: Movie[];
}

export async function getMoviesByGenre(input: GenerateMovieSuggestionsInput): Promise<GenerateMovieSuggestionsOutput> {
  if (!process.env.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not defined. Please add it to your .env file.");
  }

  const genreIds = input.genres
    .filter(g => g !== 'Tragedy')
    .map(genre => genreMap[genre as keyof typeof genreMap]);

  const movies: Movie[] = await discoverMovies({
    with_genres: genreIds.join(','),
    with_original_language: input.language,
    "primary_release_date.gte": input.startDate,
    "primary_release_date.lte": input.endDate,
  });

  return {
    suggestions: movies,
  };
}
