
import Header from "@/components/Header";
import MovieCard from "@/components/MovieCard";
import { searchMovies, Movie } from "@/services/tmdb";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

async function SearchResults({ query }: { query: string }) {
  const movies = await searchMovies(query);

  return (
    <>
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie: Movie, index: number) => (
            <MovieCard key={`${movie.id}-${index}`} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground col-span-full">
          <p>No movies found for &quot;{query}&quot;.</p>
        </div>
      )}
    </>
  );
}

function SearchSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
                 <div key={index} className="space-y-2">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-4 w-4/5" />
                 </div>
            ))}
        </div>
    );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-headline font-bold mb-8">
          {query ? `Search results for "${query}"` : "Please enter a search term"}
        </h1>
        
        {query ? (
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults query={query} />
          </Suspense>
        ) : null}
      </main>
    </>
  );
}
