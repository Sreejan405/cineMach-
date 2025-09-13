import { searchMovies, Movie } from "@/services/tmdb";
import MovieCard from "./MovieCard";
import { format, subMonths } from 'date-fns';

async function getRecentlyReleasedMovies() {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);

  const movies = await searchMovies(undefined, {
    "primary_release_date.gte": format(threeMonthsAgo, 'yyyy-MM-dd'),
    "primary_release_date.lte": format(today, 'yyyy-MM-dd'),
    sort_by: 'popularity.desc',
  });

  return movies.slice(0, 5);
}

export default async function RecentlyReleased() {
    const movies = await getRecentlyReleasedMovies();

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-headline text-center font-bold mb-8">Recently Released</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {movies.map((movie: Movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </section>
    );
}
