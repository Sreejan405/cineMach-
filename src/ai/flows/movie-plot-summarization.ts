'use server';
/**
 * @fileOverview A movie plot summarization AI agent.
 *
 * - summarizeMoviePlot - A function that handles the movie plot summarization process.
 * - SummarizeMoviePlotInput - The input type for the summarizeMoviePlot function.
 * - SummarizeMoviePlotOutput - The return type for the summarizeMoviePlot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMoviePlotInputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  moviePlot: z.string().describe('The plot of the movie.'),
});
export type SummarizeMoviePlotInput = z.infer<typeof SummarizeMoviePlotInputSchema>;

const SummarizeMoviePlotOutputSchema = z.object({
  summary: z.string().describe('A short summary of the movie plot.'),
});
export type SummarizeMoviePlotOutput = z.infer<typeof SummarizeMoviePlotOutputSchema>;

export async function summarizeMoviePlot(input: SummarizeMoviePlotInput): Promise<SummarizeMoviePlotOutput> {
  return summarizeMoviePlotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMoviePlotPrompt',
  input: {schema: SummarizeMoviePlotInputSchema},
  output: {schema: SummarizeMoviePlotOutputSchema},
  prompt: `You are an AI that summarizes movie plots.

  Summarize the following movie plot in a concise manner.

  Movie Title: {{{title}}}
  Movie Plot: {{{moviePlot}}}`,
});

const summarizeMoviePlotFlow = ai.defineFlow(
  {
    name: 'summarizeMoviePlotFlow',
    inputSchema: SummarizeMoviePlotInputSchema,
    outputSchema: SummarizeMoviePlotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
