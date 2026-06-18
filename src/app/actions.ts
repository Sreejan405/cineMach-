
"use server";

import { getMoviesByGenre, GenerateMovieSuggestionsInput, GenerateMovieSuggestionsOutput } from '@/ai/flows/generate-movie-suggestions';
import { summarizeMoviePlot, SummarizeMoviePlotInput, SummarizeMoviePlotOutput } from '@/ai/flows/movie-plot-summarization';
import { getMovieDetails, discoverMovies, searchMovies, Movie, Genre, getMovieVideos } from '@/services/tmdb';
import { getTragicMovies } from '@/ai/flows/generate-tragic-movies';
import { getMoodMovies, MoodAnswers, MoodMoviesOutput } from '@/ai/flows/generate-mood-movies';
import { getMoviesByDescription, DescriptionInput, DescriptionMoviesOutput } from '@/ai/flows/generate-description-movies';


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
    return await getMoviesByDescription(input);
  } catch (error) {
    console.error('Error in handleDescriptionMovies:', error);
    return { movies: [], genres: [], reasoning: '' };
  }
}
