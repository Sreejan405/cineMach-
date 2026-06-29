import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { SituationAnalysisSchema } from './analyze-user-situation';

const CandidateMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  genres: z.array(z.string()).optional().describe('Genre names of the movie.')
});

export type CandidateMovie = z.infer<typeof CandidateMovieSchema>;

const RankMoviesInputSchema = z.object({
  userAnalysis: SituationAnalysisSchema,
  situation: z.string().describe("The user's original raw text description of their situation."),
  candidateMovies: z.array(CandidateMovieSchema)
});

const MovieRankSchema = z.object({
  movieId: z.number(),
  score: z.number().describe('A score from 0 to 100 representing how well this movie fits the user\'s situation and preferences.'),
  summary: z.string().describe('A very short (one sentence) summary of why this movie is a good choice for the user.'),
  reasons: z.array(z.string()).describe('2-3 specific, brief reason bullet points (without checkmark characters) explaining why this movie fits (e.g., "Hindi language preference", "Light-hearted comedy").')
});

const RankMoviesOutputSchema = z.array(MovieRankSchema);

export const rankMoviesPrompt = ai.definePrompt({
  name: 'rankMoviesPrompt',
  input: { schema: RankMoviesInputSchema },
  output: { schema: RankMoviesOutputSchema },
  prompt: `You are an expert film critic and recommendation ranking engine.
Given a user's situation, their analyzed preferences, and a list of candidate movies, your job is to score and rank each movie based on how well it fits their request.

User's Original Situation:
"{{{situation}}}"

Analyzed Preferences:
- Preferred Language: {{userAnalysis.languageCode}}
- Target Mood: {{userAnalysis.mood}}
- Energy Level: {{userAnalysis.energy}}
- Context: {{userAnalysis.context}}
- Preferred Genres: {{userAnalysis.genres}}
- Keywords/Vibes: {{userAnalysis.keywords}}
- Avoid: {{userAnalysis.avoid}}

Candidate Movies:
{{#each candidateMovies}}
- ID: {{this.id}} | Title: "{{this.title}}" | Genres: {{this.genres}}
  Overview: {{this.overview}}
{{/each}}

Instructions:
1. Score each movie from 0 to 100 based on:
   - Match with user's preferred genres and language (high priority).
   - Match with user's mood, energy level, and viewing context.
   - Absence of avoid criteria.
2. For each movie, write a short, one-sentence summary (e.g. "A delightful comedy about family bonds that is perfect for winding down after a long day.")
3. Write 2-3 specific, brief reason bullet points (e.g. "Matches your low-energy mood", "Hindi language preference", "Light-hearted comedy"). Do not include any checkmark symbols (like ✓) in the reasons themselves.
4. Output a JSON array containing the score, summary, and reasons for all candidate movies. Sort the array descending by score.`
});

export const rankMoviesFlow = ai.defineFlow(
  {
    name: 'rankMoviesFlow',
    inputSchema: RankMoviesInputSchema,
    outputSchema: RankMoviesOutputSchema,
  },
  async (input) => {
    const { output } = await rankMoviesPrompt(input);
    return output!;
  }
);
