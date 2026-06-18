'use server';
/**
 * @fileOverview AI flow that takes a free-text description of the user's
 * situation / preferences and returns movie suggestions using Gemini.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { discoverMovies, searchMovies, Movie } from '@/services/tmdb';

// ─── Schemas ────────────────────────────────────────────────────────────────

const DescriptionInputSchema = z.object({
  description: z.string().describe(
    "The user's free-text description of their current mood, situation, and movie preferences."
  ),
});
export type DescriptionInput = z.infer<typeof DescriptionInputSchema>;

const GenreExtractionOutputSchema = z.object({
  genres: z.array(z.string()).describe(
    'Array of 2-4 TMDB genre names that best match the description. ' +
    'Valid values: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, ' +
    'Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, ' +
    'Thriller, War, Western.'
  ),
  reasoning: z.string().describe(
    'One concise sentence explaining why these genres suit the description.'
  ),
  searchTerms: z.array(z.string()).describe(
    'Array of 2-3 specific movie titles that would perfectly fit the user\'s description. ' +
    'These are used as fallback search terms if genre discovery returns poor results.'
  ),
});
type GenreExtractionOutput = z.infer<typeof GenreExtractionOutputSchema>;

export interface DescriptionMoviesOutput {
  movies: Movie[];
  genres: string[];
  reasoning: string;
}

// ─── TMDB genre ID map ───────────────────────────────────────────────────────

const GENRE_ID_MAP: Record<string, number> = {
  'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
  'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
  'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
  'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
  'Thriller': 53, 'War': 10752, 'Western': 37,
};

// ─── Genkit prompt & flow ────────────────────────────────────────────────────

const genreExtractionPrompt = ai.definePrompt({
  name: 'descriptionToGenresPrompt',
  input: { schema: DescriptionInputSchema },
  output: { schema: GenreExtractionOutputSchema },
  prompt: `You are a world-class film curator AI. A user has described their current situation, mood, or movie preferences in free text.

Your job is to:
1. Carefully read and understand their description.
2. Extract the emotional tone, desired experience, and any specific preferences mentioned.
3. Map these to the best matching TMDB genre names (pick 2-4).
4. Suggest 2-3 specific movie titles that would be a perfect fit.
5. Write a short, friendly sentence explaining your reasoning.

User's description: {{{description}}}

Valid TMDB genres: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western.

Respond with genres, reasoning, and searchTerms as specified.`,
});

const descriptionToGenresFlow = ai.defineFlow(
  {
    name: 'descriptionToGenresFlow',
    inputSchema: DescriptionInputSchema,
    outputSchema: GenreExtractionOutputSchema,
  },
  async (input) => {
    const { output } = await genreExtractionPrompt(input);
    return output!;
  }
);

// ─── Main exported function ──────────────────────────────────────────────────

export async function getMoviesByDescription(
  input: DescriptionInput
): Promise<DescriptionMoviesOutput> {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not defined.');
  }

  // Step 1: Use Gemini to extract genres + specific title recommendations
  const aiResult: GenreExtractionOutput = await descriptionToGenresFlow(input);

  const { genres, reasoning, searchTerms } = aiResult;

  // Step 2: Map genre names to TMDB IDs
  const genreIds = genres
    .map(g => GENRE_ID_MAP[g])
    .filter(Boolean);

  let movies: Movie[] = [];

  // Step 3a: Discover by genre
  if (genreIds.length > 0) {
    movies = await discoverMovies({
      with_genres: genreIds.join(','),
      sort_by: 'popularity.desc',
      'vote_average.gte': '6.5',
      'vote_count.gte': '100',
    });
  }

  // Step 3b: If genre discovery returns <3 results, fall back to title search
  if (movies.length < 3 && searchTerms.length > 0) {
    const searchResults = await Promise.all(
      searchTerms.map(term => searchMovies(term))
    );
    const fallbackMovies = searchResults
      .flat()
      .filter(m => m.vote_average >= 6);
    // Merge, deduplicate by id
    const seen = new Set(movies.map(m => m.id));
    for (const m of fallbackMovies) {
      if (!seen.has(m.id)) {
        movies.push(m);
        seen.add(m.id);
      }
    }
  }

  return {
    movies: movies.slice(0, 5),
    genres,
    reasoning,
  };
}
