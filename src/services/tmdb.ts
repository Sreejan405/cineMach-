
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  popularity: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
    iso_639_1: string;
    iso_3166_1: string;
    name: string;
    key: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
    id: string;
}

interface DiscoverMoviesParams {
  with_genres?: string;
  with_keywords?: string;
  language?: string;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  with_original_language?: string;
  sort_by?: string;
}

export async function discoverMovies(params: DiscoverMoviesParams = {}): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not defined. Please add it to your .env file.");
  }

  const url = new URL(`${TMDB_API_URL}/discover/movie`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('include_adult', 'false');
  url.searchParams.append('include_video', 'false');
  url.searchParams.append('sort_by', params.sort_by || 'popularity.desc');
  url.searchParams.append('page', '1');

  for (const [key, value] of Object.entries(params)) {
    if (value && key !== 'sort_by') {
      url.searchParams.append(key, value);
    }
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error(`TMDB API error: ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return data.results || [];
}

interface SearchMoviesParams {
    language?: string;
    'primary_release_date.gte'?: string;
    'primary_release_date.lte'?: string;
    sort_by?: string;
}

export async function searchMovies(query?: string, params: SearchMoviesParams = {}): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not defined. Please add it to your .env file.");
  }

  const endpoint = query ? '/search/movie' : '/discover/movie';
  const url = new URL(`${TMDB_API_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('include_adult', 'false');
  url.searchParams.append('page', '1');

  if(query) {
    url.searchParams.append('query', query);
  } else {
    url.searchParams.append('sort_by', params.sort_by || 'popularity.desc');
  }

  for (const [key, value] of Object.entries(params)) {
    if (value && key !== 'sort_by') {
      url.searchParams.append(key, value);
    }
  }
  
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error(`TMDB API error: ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return data.results || [];
}

export interface MovieDetails extends Movie {
    genres: Genre[];
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails | null> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not defined. Please add it to your .env file.");
  }

  const url = new URL(`${TMDB_API_URL}/movie/${movieId}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error(`TMDB API error for movie details: ${res.statusText}`);
    return null;
  }

  const data = await res.json();
  return data;
}


export async function getMovieVideos(movieId: number): Promise<Video[]> {
    if (!TMDB_API_KEY) {
        throw new Error("TMDB_API_KEY is not defined. Please add it to your .env file.");
    }

    const url = new URL(`${TMDB_API_URL}/movie/${movieId}/videos`);
    url.searchParams.append('api_key', TMDB_API_KEY);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
        console.error(`TMDB API error for movie videos: ${res.statusText}`);
        return [];
    }
    const data = await res.json();
    return data.results || [];
}


export async function getSimilarMovies(movieId: number): Promise<Movie[]> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not defined. Please add it to your .env file.");
  }

  const url = new URL(`${TMDB_API_URL}/movie/${movieId}/similar`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('page', '1');

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error(`TMDB API error for similar movies: ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return data.results || [];
}


export async function getGenres(): Promise<Genre[]> {
   if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not defined. Please add it to your .env file.");
  }

  const url = new URL(`${TMDB_API_URL}/genre/movie/list`);
  url.searchParams.append('api_key', TMDB_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`TMDB API error: ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  return data.genres || [];
}
