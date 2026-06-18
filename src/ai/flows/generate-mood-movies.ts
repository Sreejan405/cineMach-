'use server';

import { discoverMovies, Movie } from '@/services/tmdb';

export interface MoodAnswers {
  feeling: string;   // Q1
  experience: string; // Q2
  vibe: string;      // Q3
}

export interface MoodMoviesOutput {
  movies: Movie[];
  genres: string[];
}

// Maps each answer combination to TMDB genre IDs
// TMDB genre IDs:
// 28=Action, 12=Adventure, 16=Animation, 35=Comedy, 80=Crime
// 99=Documentary, 18=Drama, 10751=Family, 14=Fantasy, 36=History
// 27=Horror, 10402=Music, 9648=Mystery, 10749=Romance, 878=Sci-Fi
// 53=Thriller, 10752=War, 37=Western

const feelingGenreMap: Record<string, number[]> = {
  'Happy':       [35, 10751, 16],       // Comedy, Family, Animation
  'Sad':         [18, 10749, 10402],    // Drama, Romance, Music
  'Stressed':    [35, 12, 14],          // Comedy, Adventure, Fantasy
  'Bored':       [28, 12, 878],         // Action, Adventure, Sci-Fi
  'Romantic':    [10749, 10402, 18],    // Romance, Music, Drama
  'Adventurous': [12, 28, 14],          // Adventure, Action, Fantasy
};

const experienceGenreMap: Record<string, number[]> = {
  'Make me laugh':       [35, 10751],   // Comedy, Family
  'Keep me on edge':     [53, 9648],    // Thriller, Mystery
  'Make me think':       [18, 99, 878], // Drama, Documentary, Sci-Fi
  'Inspire me':          [18, 36, 12],  // Drama, History, Adventure
  'Scare me':            [27, 53, 9648], // Horror, Thriller, Mystery
};

const vibeGenreMap: Record<string, number[]> = {
  'Light & easy':      [35, 10751, 16], // Comedy, Family, Animation
  'Deep & meaningful': [18, 36, 99],    // Drama, History, Documentary
  'Action-packed':     [28, 12, 878],   // Action, Adventure, Sci-Fi
  'Slow burn':         [18, 9648, 53],  // Drama, Mystery, Thriller
};

// Human-readable genre name lookup
const genreNameMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

// Reverse map: genre name -> ID (for suggestions page URL)
const genreStringMap: Record<string, number> = {
  'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
  'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
  'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
  'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
  'Thriller': 53, 'War': 10752, 'Western': 37,
};

export async function getMoodMovies(answers: MoodAnswers): Promise<MoodMoviesOutput> {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not defined.');
  }

  // Collect all candidate genre IDs from all 3 answers
  const feelingIds  = feelingGenreMap[answers.feeling]    ?? [];
  const experienceIds = experienceGenreMap[answers.experience] ?? [];
  const vibeIds     = vibeGenreMap[answers.vibe]          ?? [];

  // Score genres by frequency across answers (intersection = higher priority)
  const scoreMap: Record<number, number> = {};
  [...feelingIds, ...experienceIds, ...vibeIds].forEach(id => {
    scoreMap[id] = (scoreMap[id] ?? 0) + 1;
  });

  // Sort by score descending, take top 2-3
  const topGenreIds = Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => Number(id));

  const topGenreNames = topGenreIds.map(id => genreNameMap[id]).filter(Boolean);

  try {
    const movies = await discoverMovies({
      with_genres: topGenreIds.join(','),
      sort_by: 'popularity.desc',
      'vote_average.gte': '6.5',
      'vote_count.gte': '200',
    });

    return {
      movies: movies.slice(0, 5),
      genres: topGenreNames,
    };
  } catch (error) {
    console.error('Error fetching mood movies:', error);
    return { movies: [], genres: topGenreNames };
  }
}
