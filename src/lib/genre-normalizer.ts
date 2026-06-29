/**
 * Valid TMDB genre names.
 */
export const TMDB_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Music',
  'Mystery',
  'Romance',
  'Science Fiction',
  'Thriller',
  'War',
  'Western',
] as const;

export type TMDBGenreName = typeof TMDB_GENRES[number];

const GENRE_MAP: Record<string, TMDBGenreName[]> = {
  // Lowercase standard genres for easy lookup
  action: ['Action'],
  adventure: ['Adventure'],
  animation: ['Animation'],
  comedy: ['Comedy'],
  crime: ['Crime'],
  documentary: ['Documentary'],
  drama: ['Drama'],
  family: ['Family'],
  fantasy: ['Fantasy'],
  history: ['History'],
  horror: ['Horror'],
  music: ['Music'],
  mystery: ['Mystery'],
  romance: ['Romance'],
  'science fiction': ['Science Fiction'],
  scifi: ['Science Fiction'],
  'sci-fi': ['Science Fiction'],
  thriller: ['Thriller'],
  war: ['War'],
  western: ['Western'],

  // Concept / Theme mappings
  'feel-good': ['Comedy', 'Drama', 'Family'],
  'feel good': ['Comedy', 'Drama', 'Family'],
  heartwarming: ['Comedy', 'Drama', 'Family'],
  'heart-warming': ['Comedy', 'Drama', 'Family'],
  'mind-bending': ['Science Fiction', 'Mystery'],
  'mind bending': ['Science Fiction', 'Mystery'],
  'thought-provoking': ['Drama', 'Mystery'],
  'thought provoking': ['Drama', 'Mystery'],
  motivational: ['Drama', 'History'],
  inspiring: ['Drama', 'History'],
  spooky: ['Horror'],
  scary: ['Horror', 'Thriller'],
  funny: ['Comedy'],
  sad: ['Drama'],
  emotional: ['Drama', 'Romance'],
  tragic: ['Drama'],
  tragedy: ['Drama'],
  'action-packed': ['Action', 'Thriller'],
  intense: ['Thriller', 'Action'],
  suspenseful: ['Thriller', 'Mystery'],
  romantic: ['Romance'],
  magical: ['Fantasy'],
  cartoon: ['Animation', 'Family'],
  musical: ['Music'],
};

/**
 * Normalizes a list of arbitrary genre names/keywords into standard TMDB genre names.
 */
export function normalizeGenres(inputs: string[]): TMDBGenreName[] {
  const normalizedSet = new Set<TMDBGenreName>();

  for (const input of inputs) {
    const cleaned = input.toLowerCase().trim();
    if (GENRE_MAP[cleaned]) {
      GENRE_MAP[cleaned].forEach((genre) => normalizedSet.add(genre));
    } else {
      // Direct string matching helper for partial matches
      const matchedGenre = TMDB_GENRES.find(
        (g) => g.toLowerCase() === cleaned || cleaned.includes(g.toLowerCase())
      );
      if (matchedGenre) {
        normalizedSet.add(matchedGenre);
      }
    }
  }

  // Fallback to a default genre if nothing could be matched
  if (normalizedSet.size === 0) {
    return ['Drama'];
  }

  return Array.from(normalizedSet);
}
