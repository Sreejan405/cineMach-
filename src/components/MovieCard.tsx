
import Link from 'next/link';
import Image from 'next/image';
import { Star, Calendar } from 'lucide-react';
import type { Movie } from '@/services/tmdb';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const encodedTitle = encodeURIComponent(movie.title);

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `https://placehold.co/300x450/1a0a2e/a855f7?text=${encodeURIComponent(movie.title)}`;

  const href = `/movie/${encodedTitle}?poster=${encodeURIComponent(movie.poster_path || '')}&rating=${movie.vote_average}&overview=${encodeURIComponent(movie.overview || '')}&id=${movie.id}`;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <Link href={href} className="group block">
      <div className="movie-card-glow relative overflow-hidden rounded-lg transition-all duration-300 group-hover:-translate-y-1.5 bg-card border border-border/50">
        {/* Poster */}
        <div className="aspect-[2/3] relative">
          <Image
            src={posterUrl}
            alt={`Poster for ${movie.title}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="movie poster"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            {movie.overview && (
              <p className="text-white/80 text-xs leading-relaxed line-clamp-4">
                {movie.overview}
              </p>
            )}
          </div>
          {/* Rating badge */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 space-y-1">
          <h3
            className="font-semibold text-sm leading-tight w-full truncate group-hover:text-accent transition-colors"
            title={movie.title}
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {releaseYear && (
              <>
                <Calendar className="h-3 w-3" />
                <span>{releaseYear}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
