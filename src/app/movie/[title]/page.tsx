



import Header from "@/components/Header";
import Image from "next/image";
import { Star, ExternalLink } from 'lucide-react';
import SimilarMovies from "@/components/SimilarMovies";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieDetailClient } from "@/components/MovieDetailClient";
import { Button } from "@/components/ui/button";


interface MovieDetailPageProps {
  params: {
    title: string;
  };
  searchParams: {
    poster?: string;
    rating?: string;
  }
}

function SimilarMoviesSkeleton() {
  return (
    <div className="mt-16">
      <h2 className="text-3xl font-headline font-bold mb-8 text-center">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-[450px] w-full" />
            <Skeleton className="h-4 w-4/5 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}


export default function MovieDetailPage({ params, searchParams }: MovieDetailPageProps) {
  const title = decodeURIComponent(params.title);
  const posterPath = searchParams.poster;
  const rating = searchParams.rating ? parseFloat(searchParams.rating) : null;

  const posterUrl = posterPath && posterPath !== 'null'
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : `https://placehold.co/500x750/4B0082/E6E6FA?text=${encodeURIComponent(title)}`;

  const googleSearchUrl = `https://www.google.com/search?q=Watch+${encodeURIComponent(title)}+online`;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="aspect-[2/3] w-full relative rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={posterUrl}
                alt={`Poster for ${title}`}
                fill
                className="object-cover"
                data-ai-hint="movie poster"
              />
            </div>
            <Button asChild className="mt-4 bg-accent hover:bg-accent/90">
              <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer">
                Watch Now
              </a>
            </Button>
          </div>
          <div className="md:col-span-2">
             <MovieDetailClient title={title} rating={rating} />
          </div>
        </div>
        <Suspense fallback={<SimilarMoviesSkeleton />}>
          <SimilarMovies title={title} />
        </Suspense>
      </main>
    </>
  );
}
