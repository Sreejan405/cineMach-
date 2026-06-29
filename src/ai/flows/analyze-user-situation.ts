import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SituationAnalysisSchema = z.object({
  languageCode: z.string().nullable().describe('ISO 639-1 language code (e.g. en, hi, es, fr, ja, ko) preferred by the user, or null if not specified.'),
  mood: z.string().describe('The identified mood or emotional state (e.g. relaxed, happy, sad, excited, tense, etc.)'),
  energy: z.enum(['low', 'medium', 'high']).describe('The identified energy level'),
  context: z.string().describe('The viewing context (e.g. after_work, date_night, family_movie_night, alone, with_friends, etc.)'),
  genres: z.array(z.string()).describe('List of standard TMDB genres that match: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western.'),
  keywords: z.array(z.string()).describe('List of key themes or terms describing the request (e.g. feel good, light hearted, mind bending)'),
  avoid: z.array(z.string()).describe('Themes, elements, or genres to avoid (e.g. dark, complex, violence, tragedy)'),
  confidence: z.number().describe('A confidence score from 0.0 to 1.0 indicating if the description contains clear movie signals vs random noise.')
});

export type SituationAnalysis = z.infer<typeof SituationAnalysisSchema>;

const AnalyzeUserSituationInputSchema = z.object({
  situation: z.string().describe("The user's situation, mood, or movie preferences in free text.")
});

export const analyzeUserSituationPrompt = ai.definePrompt({
  name: 'analyzeUserSituationPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: { schema: AnalyzeUserSituationInputSchema },
  output: { schema: SituationAnalysisSchema },
  prompt: `You are an expert film curator and user intent analyzer. A user has described their current situation, mood, or movie preferences in free text.

Your job is to analyze the text and extract structured recommendation signals:
1. Identify if they specified a language preference. Map it to its standard two-letter ISO 639-1 code (e.g., English -> "en", Hindi -> "hi", Spanish -> "es", French -> "fr", Chinese -> "zh", Malayalam -> "ml", Tamil -> "ta", Telugu -> "te", Bengali -> "bn"). If no language is explicitly requested or implied, return null.
2. Determine their mood or emotional state.
3. Classify their energy level as "low", "medium", or "high".
4. Determine the viewing context (e.g., "after_work", "date_night", "family_movie_night", "alone", "with_friends", "bored_at_home").
5. Extract standard matching TMDB genres (pick at least 1-3). Standard genres: Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family, Fantasy, History, Horror, Music, Mystery, Romance, Science Fiction, Thriller, War, Western.
6. Extract key themes, keywords, or vibes (e.g., "feel good", "road trip", "suspense", "mind bending").
7. Identify elements they want to avoid (e.g., "depressing", "jump scares", "complicated plots", "violence", "tragedy").
8. Set a confidence score from 0.0 to 1.0. If the input is random gibberish, keyboard-mash, or completely unrelated to movies or mood, set confidence lower (under 0.4).

User's input: "{{{situation}}}"

Restrictions:
- Do NOT recommend specific movies or include movie titles.
- Do NOT invent genres outside the valid TMDB list.
- Return ONLY the structured JSON matching the output schema.`
});

export const analyzeUserSituationFlow = ai.defineFlow(
  {
    name: 'analyzeUserSituationFlow',
    inputSchema: AnalyzeUserSituationInputSchema,
    outputSchema: SituationAnalysisSchema,
  },
  async (input) => {
    const { output } = await analyzeUserSituationPrompt(input);
    return output!;
  }
);
