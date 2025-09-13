'use server';
/**
 * @fileOverview Suggests similar movies.
 */

import {ai} from '@/ai/genkit';
import { searchMovies, Movie } from '@/services/tmdb';
import {z} from 'genkit';

const SimilarMoviesInputSchema = z.object({
  title: z.string().describe('The title of the movie to find similar movies for.'),
});
export type SimilarMoviesInput = z.infer<typeof SimilarMoviesInputSchema>;

const SimilarMoviesOutputSchema = z.object({
  titles: z.array(z.string()).describe('A list of 5 similar movie titles.'),
});
export type SimilarMoviesOutput = z.infer<typeof SimilarMoviesOutputSchema>;


export async function getSimilarMovies(input: SimilarMoviesInput): Promise<Movie[]> {
  const similarMoviesList = await similarMoviesFlow(input);
  if (!similarMoviesList || similarMoviesList.titles.length === 0) {
    return [];
  }
  
  const moviePromises = similarMoviesList.titles.map(title => searchMovies(title));
  const moviesData = await Promise.all(moviePromises);
  
  // Return the first result for each search, filtering out empty results
  return moviesData.map(movieArray => movieArray[0]).filter(Boolean);
}

const prompt = ai.definePrompt({
  name: 'similarMoviesPrompt',
  input: {schema: SimilarMoviesInputSchema},
  output: {schema: SimilarMoviesOutputSchema},
  prompt: `You are a movie expert. Given a movie title, suggest 5 similar movies.

Movie Title: {{{title}}}`,
});

const similarMoviesFlow = ai.defineFlow(
  {
    name: 'similarMoviesFlow',
    inputSchema: SimilarMoviesInputSchema,
    outputSchema: SimilarMoviesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
