// services/omdb.ts

export type MovieDB = {
  title: string;
  poster: string | null;
  year: string | null;
  imdbID: string;
};

export async function searchMoviesByKeyword(
  keyword: string,
  year?: string
): Promise<MovieDB[]> {
  const params = new URLSearchParams({
    apikey: process.env.OMDB_API_KEY!,
    s: keyword,
    type: 'movie',
  });
  if (year) params.set('y', year);

  const res = await fetch(`https://www.omdbapi.com/?${params.toString()}`);
  if (!res.ok) {
    console.error(`OMDb API error: ${res.statusText}`);
    return [];
  }
  const data = await res.json();
  if (data.Response === 'False' || !data.Search) return [];

  return data.Search.slice(0, 10).map((m: any) => ({
    title: m.Title,
    poster: m.Poster && m.Poster !== 'N/A' ? m.Poster : null,
    year: m.Year || null,
    imdbID: m.imdbID,
  }));
}
