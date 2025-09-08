
"use client";

import { useEffect, useState } from "react";
import { handleGetSimilarMovies } from "@/app/actions";
import { Movie } from "@/services/tmdb";
import MovieCard from "./MovieCard";
import { Skeleton } from "./ui/skeleton";

interface SimilarMoviesProps {
  title: string;
}

export default function SimilarMovies({ title }: SimilarMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState<string | undefined>();

  useEffect(() => {
    async function fetchSimilarMovies() {
      setIsLoading(true);
      const { similarMovies, reason } = await handleGetSimilarMovies(title);
      
      setMovies(similarMovies);
      setReason(reason);
      setIsLoading(false);
    }
    fetchSimilarMovies();
  }, [title]);

  if (isLoading) {
    return (
       <div className="mt-16">
        <h2 className="text-3xl font-headline font-bold mb-8 text-center">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                    <Skeleton className="h-[300px] w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ))}
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-3xl font-headline font-bold mb-8 text-center">
        You Might Also Like {reason && `(More ${reason})`}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
