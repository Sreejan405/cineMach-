import type { Metadata } from "next";
import Header from "@/components/Header";
import Image from "next/image";
import SimilarMovies from "@/components/SimilarMovies";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieDetailClient } from "@/components/MovieDetailClient";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface MovieDetailPageProps {
  params: Promise<{
    title: string;
  }>;
  searchParams: Promise<{
    poster?: string;
    rating?: string;
    overview?: string;
    id?: string;
  }>;
}

export async function generateMetadata(
  props: MovieDetailPageProps
): Promise<Metadata> {
  const params = await props.params;
  const title = decodeURIComponent(params.title);
  return {
    title: title,
    description: `Watch ${title} — get an AI-powered plot summary, find the trailer, and discover similar movies on CineMatch.`,
    openGraph: {
      title: `${title} | CineMatch`,
      description: `Discover ${title} on CineMatch — AI plot summaries, trailers, and similar movie recommendations.`,
    },
  };
}

function SimilarMoviesSkeleton() {
  return (
    <div className="mt-16">
      <h2 className="text-3xl font-headline font-bold mb-8 text-center">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <Skeleton className="h-4 w-4/5 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function MovieDetailPage(props: MovieDetailPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const title = decodeURIComponent(params.title);
  const posterPath = searchParams.poster;
  const ratingString = searchParams.rating;
  const rating = ratingString ? parseFloat(ratingString) : null;
  const overview = searchParams.overview ? decodeURIComponent(searchParams.overview) : null;
  let movieId: number | null = null;

  try {
    const searchRes = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}&page=1`,
      { next: { revalidate: 86400 } }
    );

    console.log("TMDB search status:", searchRes.status);

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      movieId = searchData.results?.[0]?.id ?? null;
      console.log("Movie ID found:", movieId);
    } else {
      console.error("TMDB search failed with status:", searchRes.status, await searchRes.text());
    }
  } catch (error) {
    console.error("Failed to search movie by title:", error);
  }

  interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }
  interface CrewMember {
    id: number;
    name: string;
    job: string;
    profile_path: string | null;
  }
  interface ProductionCompany {
    id: number;
    name: string;
    logo_path: string | null;
  }

  let cast: CastMember[] = [];
  let director: CrewMember | null = null;
  let productionCompanies: ProductionCompany[] = [];

  if (movieId) {
    try {
      const [creditsRes, detailsRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`,
          { next: { revalidate: 86400 } }
        ),
        fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`,
          { next: { revalidate: 86400 } }
        ),
      ]);

      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        cast = creditsData.cast?.slice(0, 8) ?? [];
        director = creditsData.crew?.find((p: CrewMember) => p.job === "Director") ?? null;
      }

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        productionCompanies = detailsData.production_companies ?? [];
      }
    } catch (error) {
      console.error("Failed to fetch movie credits:", error);
    }
  }

  const posterUrl =
    posterPath && posterPath !== "null"
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : `https://placehold.co/500x750/1a0a2e/a855f7?text=${encodeURIComponent(title)}`;

  const googleSearchUrl = `https://www.google.com/search?q=Watch+${encodeURIComponent(title)}+online`;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
          {/* Poster column */}
          <div className="md:col-span-1 flex flex-col items-center gap-4">
            <div className="aspect-[2/3] w-full relative rounded-xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
              <Image
                src={posterUrl}
                alt={`Poster for ${title}`}
                fill
                className="object-cover"
                data-ai-hint="movie poster"
                priority
                sizes="(max-width: 768px) 90vw, 33vw"
              />
            </div>
            <Button
              asChild
              className="w-full bg-accent hover:bg-accent/90 shadow-lg shadow-purple-900/30"
            >
              <a href={googleSearchUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch Online
              </a>
            </Button>
          </div>

          {/* Detail column */}
          <div className="md:col-span-2">
            <MovieDetailClient 
              title={title} 
              rating={rating} 
              overview={overview} 
              cast={cast}
              director={director}
              productionCompanies={productionCompanies}
            />
          </div>
        </div>

        {/* Similar movies */}
        <Suspense fallback={<SimilarMoviesSkeleton />}>
          <SimilarMovies title={title} />
        </Suspense>
      </main>
    </>
  );
}
