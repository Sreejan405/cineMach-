'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DescriptionInputSchema = z.object({
  description: z.string(),
});
export type DescriptionInput = z.infer<typeof DescriptionInputSchema>;

const GenreExtractionOutputSchema = z.object({
  genres: z.array(z.string()),
  reasoning: z.string(),
  searchTerms: z.array(z.string()),
});

export interface DescriptionMoviesOutput {
  movies: {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    overview: string;
    release_date: string;
  }[];
  genres: string[];
  reasoning: string;
}

const GENRE_ID_MAP: Record<string, number> = {
  'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
  'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
  'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
  'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
  'Thriller': 53, 'War': 10752, 'Western': 37,
};

const genreExtractionPrompt = ai.definePrompt({
  name: 'descriptionToGenresPromptV2',
  input: { schema: DescriptionInputSchema },
  output: { schema: GenreExtractionOutputSchema },
  prompt: `You are a world-class film curator. A user described their mood or situation.

Extract movie recommendation signals from their description.

User: {{{description}}}

Valid TMDB genres only: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western.

Return:
- genres: 2-3 best matching genre names from the list above
- reasoning: one friendly sentence explaining why
- searchTerms: 2-3 specific movie titles that perfectly fit`,
});

const descriptionToGenresFlow = ai.defineFlow(
  {
    name: 'descriptionToGenresFlowV2',
    inputSchema: DescriptionInputSchema,
    outputSchema: GenreExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await genreExtractionPrompt(input);
    return output!;
  }
);

export async function getMoviesByDescription(
  input: DescriptionInput
): Promise<DescriptionMoviesOutput> {
  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) throw new Error('TMDB_API_KEY is not defined.');

  // Step 1: AI extracts genres
  const aiResult = await descriptionToGenresFlow(input);
  const { genres, reasoning, searchTerms } = aiResult;

  console.log('[MoodAI] Genres:', genres);
  console.log('[MoodAI] SearchTerms:', searchTerms);

  const genreIds = genres.map(g => GENRE_ID_MAP[g]).filter(Boolean);
  console.log('[MoodAI] Genre IDs:', genreIds);

  type RawMovie = {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    overview: string;
    release_date: string;
  };

  let movies: RawMovie[] = [];

  // Step 2a: Discover by genre — direct TMDB fetch
  if (genreIds.length > 0) {
    const url =
      `https://api.themoviedb.org/3/discover/movie` +
      `?api_key=${TMDB_KEY}` +
      `&with_genres=${genreIds.join(',')}` +
      `&sort_by=popularity.desc` +
      `&vote_average.gte=5.5` +
      `&vote_count.gte=30` +
      `&page=1`;

    console.log('[MoodAI] Discover URL:', url);
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    console.log('[MoodAI] Discover count:', data.results?.length ?? 0);
    movies = data.results?.slice(0, 8) ?? [];
  }

  // Step 2b: Fallback — search by specific titles if genre returns <3
  if (movies.length < 3 && searchTerms.length > 0) {
    console.log('[MoodAI] Falling back to title search...');
    for (const term of searchTerms.slice(0, 3)) {
      const url =
        `https://api.themoviedb.org/3/search/movie` +
        `?api_key=${TMDB_KEY}` +
        `&query=${encodeURIComponent(term)}` +
        `&page=1`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      const data = await res.json();
      const seen = new Set(movies.map(m => m.id));
      for (const m of data.results ?? []) {
        if (!seen.has(m.id) && m.vote_average >= 5) {
          movies.push(m);
          seen.add(m.id);
        }
      }
    }
  }

  console.log('[MoodAI] Final movie count:', movies.length);

  return {
    movies: movies.slice(0, 5),
    genres,
    reasoning,
  };
}