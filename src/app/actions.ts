
"use server";

import { getMoviesByGenre, GenerateMovieSuggestionsInput, GenerateMovieSuggestionsOutput } from '@/ai/flows/generate-movie-suggestions';
import { summarizeMoviePlot, SummarizeMoviePlotInput, SummarizeMoviePlotOutput } from '@/ai/flows/movie-plot-summarization';
import { getMovieDetails, discoverMovies, searchMovies, Movie, Genre, getMovieVideos } from '@/services/tmdb';
import { getTragicMovies } from '@/ai/flows/generate-tragic-movies';
import { getMoodMovies, MoodAnswers, MoodMoviesOutput } from '@/ai/flows/generate-mood-movies';
import { DescriptionInput } from '@/ai/flows/generate-description-movies';
import { analyzeUserSituationFlow, SituationAnalysis } from '@/ai/flows/analyze-user-situation';
import { normalizeGenres } from '@/lib/genre-normalizer';

export interface RankedMovie extends Movie {
  score?: number;
  summary?: string;
  reasons?: string[];
}

export interface DescriptionMoviesOutput {
  movies: RankedMovie[];
  genres: string[];
  reasoning: string;
  analysis?: SituationAnalysis;
}

const GENRE_ID_MAP: Record<string, number> = {
  'Action': 28, 'Adventure': 12, 'Animation': 16, 'Comedy': 35,
  'Crime': 80, 'Documentary': 99, 'Drama': 18, 'Family': 10751,
  'Fantasy': 14, 'History': 36, 'Horror': 27, 'Music': 10402,
  'Mystery': 9648, 'Romance': 10749, 'Science Fiction': 878,
  'Thriller': 53, 'War': 10752, 'Western': 37,
};

const REVERSE_GENRE_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(GENRE_ID_MAP).map(([name, id]) => [id, name])
);


export async function handleGetSuggestions(input: GenerateMovieSuggestionsInput): Promise<GenerateMovieSuggestionsOutput> {
  const { otts, ...safeInput } = input;

  if (safeInput.genres.includes('Recently Released')) {
    const movies = await searchMovies(undefined, {
      "primary_release_date.gte": new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
      "primary_release_date.lte": new Date().toISOString().split('T')[0],
    });
    return { suggestions: movies.slice(0,10) };
  }
  
  if (safeInput.genres.includes('Tragedy')) {
    const tragicMovieTitles = await getTragicMovies({ language: safeInput.language });
    
    if (safeInput.genres.length > 1) {
        const otherGenres = safeInput.genres.filter(g => g !== 'Tragedy');
        const genreMovies = await getMoviesByGenre({ ...safeInput, genres: otherGenres } as GenerateMovieSuggestionsInput);
        
        const tragicTitlesLower = tragicMovieTitles.map(t => t.toLowerCase());
        const filteredSuggestions = genreMovies.suggestions.filter(movie => 
            tragicTitlesLower.includes(movie.title.toLowerCase())
        );

        if (filteredSuggestions.length > 0) {
            return { suggestions: filteredSuggestions };
        }
    }

    const moviePromises = tragicMovieTitles.map(title => searchMovies(title, {language: safeInput.language}));
    const moviesData = await Promise.all(moviePromises);
    const suggestions = moviesData.map(movieArray => movieArray[0]).filter(Boolean);
    return { suggestions };
  }

  const suggestions = await getMoviesByGenre(safeInput as GenerateMovieSuggestionsInput);
  
  return suggestions;
}

export async function handleSummarizePlot(input: SummarizeMoviePlotInput): Promise<SummarizeMoviePlotOutput> {
    try {
        const result = await summarizeMoviePlot(input);
        return result;
    } catch (error) {
        console.error("Error summarizing plot:", error);
        return { summary: "Could not generate summary." };
    }
}

export async function handleGetSimilarMovies(title: string): Promise<{ similarMovies: Movie[], reason?: string }> {
  try {
    const searchResult = await searchMovies(title);
    if (!searchResult || searchResult.length === 0) {
      return { similarMovies: [] };
    }
    
    const originalMovie = searchResult[0];
    const movieDetails = await getMovieDetails(originalMovie.id);
    
    if (!movieDetails || !movieDetails.genres || movieDetails.genres.length === 0) {
        return { similarMovies: [] };
    }

    const genreIds = movieDetails.genres.map(g => g.id).join(',');
    const primaryGenreName = movieDetails.genres[0].name;

    const similarMovies = await discoverMovies({
        with_genres: genreIds,
    });
    
    const filteredAndSorted = similarMovies
        .filter(movie => movie.id !== originalMovie.id && movie.vote_average >= 6.5)
        .sort((a, b) => b.popularity - a.popularity);

    return { similarMovies: filteredAndSorted.slice(0, 5), reason: primaryGenreName };

  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return { similarMovies: [] };
  }
}


export async function handleGetTrailer(title: string): Promise<string | null> {
  try {
    const searchResult = await searchMovies(title);
    if (!searchResult || searchResult.length === 0) {
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`;
    }

    const movieId = searchResult[0].id;
    const videos = await getMovieVideos(movieId);
    
    const officialTrailer = videos.find(video => video.type === "Trailer" && video.site === "YouTube" && video.official);

    if (officialTrailer) {
      return `https://www.youtube.com/watch?v=${officialTrailer.key}`;
    }

    // Fallback to first trailer if no official one is found
    const anyTrailer = videos.find(video => video.type === "Trailer" && video.site === "YouTube");
     if (anyTrailer) {
      return `https://www.youtube.com/watch?v=${anyTrailer.key}`;
    }
    
    // Fallback to searching on YouTube
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`;

  } catch (error) {
    console.error("Error fetching trailer URL:", error);
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}`;
  }
}

export async function handleMoodMovies(answers: MoodAnswers): Promise<MoodMoviesOutput> {
  try {
    return await getMoodMovies(answers);
  } catch (error) {
    console.error('Error in handleMoodMovies:', error);
    return { movies: [], genres: [] };
  }
}

export async function handleDescriptionMovies(input: DescriptionInput): Promise<DescriptionMoviesOutput> {
  try {
    const rawDescription = input.description.trim();
    if (!rawDescription) {
      return { movies: [], genres: [], reasoning: 'No description provided.' };
    }

    // Step 1: Analyze situation
    console.log("Step 1: Analyzing user situation with Genkit...");
    let analysis: SituationAnalysis;
    try {
      analysis = await analyzeUserSituationFlow({ situation: rawDescription });
      console.log("Analysis Output:", JSON.stringify(analysis, null, 2));
    } catch (error) {
      console.warn("AI Situation Analysis failed (likely quota). Using fallback keyword mapping.", error);
      // Fallback keyword mapping
      const lowerDesc = rawDescription.toLowerCase();
      const fallbackGenres = [];
      if (lowerDesc.includes('action') || lowerDesc.includes('fight') || lowerDesc.includes('explosion')) fallbackGenres.push('Action');
      if (lowerDesc.includes('comedy') || lowerDesc.includes('laugh') || lowerDesc.includes('funny')) fallbackGenres.push('Comedy');
      if (lowerDesc.includes('drama') || lowerDesc.includes('sad') || lowerDesc.includes('emotional')) fallbackGenres.push('Drama');
      if (lowerDesc.includes('horror') || lowerDesc.includes('scary') || lowerDesc.includes('fear')) fallbackGenres.push('Horror');
      if (lowerDesc.includes('romance') || lowerDesc.includes('love')) fallbackGenres.push('Romance');
      if (lowerDesc.includes('sci-fi') || lowerDesc.includes('space') || lowerDesc.includes('science fiction')) fallbackGenres.push('Science Fiction');
      if (lowerDesc.includes('thriller') || lowerDesc.includes('suspense')) fallbackGenres.push('Thriller');
      if (lowerDesc.includes('family') || lowerDesc.includes('kids')) fallbackGenres.push('Family');
      if (lowerDesc.includes('adventure') || lowerDesc.includes('journey')) fallbackGenres.push('Adventure');
      if (lowerDesc.includes('crime') || lowerDesc.includes('murder')) fallbackGenres.push('Crime');

      analysis = {
        languageCode: null,
        mood: 'Unknown',
        energy: 'medium',
        context: 'Unknown',
        genres: fallbackGenres,
        keywords: [rawDescription],
        avoid: [],
        confidence: 0.5
      };
    }

    // Step 2: Normalize genres
    console.log("Step 2: Normalizing genres...");
    const normalizedGenres = normalizeGenres(analysis.genres);
    const genreIds = normalizedGenres.map(g => GENRE_ID_MAP[g]).filter(Boolean);
    const languageCode = analysis.languageCode;

    // Step 3 & 4: Query TMDB with Layered Fallbacks
    console.log("Step 3 & 4: Querying TMDB with fallbacks...");
    let movies: Movie[] = [];

    // Fallback 1: Genre + Language (Primary query)
    if (genreIds.length > 0 && languageCode) {
      console.log(`Trying Fallback 1 (Genre + Language): Genres: ${genreIds}, Lang: ${languageCode}`);
      try {
        movies = await discoverMovies({
          with_genres: genreIds.join(','),
          with_original_language: languageCode,
          sort_by: 'popularity.desc',
          'vote_average.gte': '6.0',
          'vote_count.gte': '50',
        });
      } catch (err) {
        console.error("Discovery Fallback 1 failed:", err);
      }
    }

    // Fallback 2: Genre Only
    if (movies.length === 0 && genreIds.length > 0) {
      console.log(`Trying Fallback 2 (Genre Only): Genres: ${genreIds}`);
      try {
        movies = await discoverMovies({
          with_genres: genreIds.join(','),
          sort_by: 'popularity.desc',
          'vote_average.gte': '6.0',
          'vote_count.gte': '50',
        });
      } catch (err) {
        console.error("Discovery Fallback 2 failed:", err);
      }
    }

    // Fallback 3: Language Only
    if (movies.length === 0 && languageCode) {
      console.log(`Trying Fallback 3 (Language Only): Lang: ${languageCode}`);
      try {
        movies = await discoverMovies({
          with_original_language: languageCode,
          sort_by: 'popularity.desc',
          'vote_average.gte': '6.0',
          'vote_count.gte': '50',
        });
      } catch (err) {
        console.error("Discovery Fallback 3 failed:", err);
      }
    }

    // Fallback 4: General Popular Movies
    if (movies.length === 0) {
      console.log("Trying Fallback 4 (Popular Movies)...");
      try {
        movies = await discoverMovies({
          sort_by: 'popularity.desc',
          'vote_average.gte': '6.0',
          'vote_count.gte': '100',
        });
      } catch (err) {
        console.error("Discovery Fallback 4 failed:", err);
      }
    }

    // Fallback 5: General Trending Movies (Backup search)
    if (movies.length === 0) {
      console.log("Trying Fallback 5 (Trending Movies)...");
      try {
        movies = await searchMovies(undefined, {
          sort_by: 'popularity.desc',
        });
      } catch (err) {
        console.error("Discovery Fallback 5 failed:", err);
      }
    }

    if (movies.length === 0) {
      console.log("No movies found anywhere. Returning empty.");
      return { movies: [], genres: normalizedGenres, reasoning: 'No movies found.', analysis };
    }

    // Slice to 12 candidates
    const candidates = movies.slice(0, 12);
    console.log(`Found ${candidates.length} candidates. Applying local ranking...`);

    // Step 5 & 6: Local Ranking (AI Re-ranking removed to save quota)
    const rankedResults = candidates.map((m, idx) => {
      const baseScore = 70;
      const positionBonus = Math.max(0, 15 - idx);
      const ratingBonus = m.vote_average ? Math.min(15, (m.vote_average - 6) * 3) : 0;
      
      return {
        movieId: m.id,
        score: Math.round(baseScore + positionBonus + ratingBonus),
        summary: m.overview || '',
        reasons: ['Popular suggestion matching your criteria']
      };
    });

    const rankMap = new Map(rankedResults.map(r => [r.movieId, r]));

    // Step 7: Merge, sort, and return top 5
    const finalMovies: RankedMovie[] = candidates
      .map(m => {
        const rankInfo = rankMap.get(m.id);
        return {
          ...m,
          score: rankInfo ? rankInfo.score : 0,
          summary: rankInfo ? rankInfo.summary : (m.overview || ''),
          reasons: rankInfo ? rankInfo.reasons : []
        };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 5);

    const friendlyReasoning = `Curated matching films with focus on ${analysis.mood} mood and ${analysis.energy} energy.`;

    return {
      movies: finalMovies,
      genres: normalizedGenres,
      reasoning: friendlyReasoning,
      analysis
    };

  } catch (error) {
    console.error('Error in handleDescriptionMovies pipeline:', error);
    return { movies: [], genres: [], reasoning: 'Failed to process recommendation.' };
  }
}
