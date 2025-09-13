
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star } from 'lucide-react';
import type { Movie } from '@/services/tmdb';


interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const encodedTitle = encodeURIComponent(movie.title);
  
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : `https://placehold.co/300x450/4B0082/E6E6FA?text=${encodeURIComponent(movie.title)}`;

  const href = `/movie/${encodedTitle}?poster=${encodeURIComponent(movie.poster_path || '')}&rating=${movie.vote_average}`;

  return (
    <Link href={href}>
      <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent">
        <CardContent className="p-0">
          <div className="aspect-[2/3] relative">
            <Image
              src={posterUrl}
              alt={`Poster for ${movie.title}`}
              fill
              className="object-cover"
              data-ai-hint="movie poster"
            />
          </div>
        </CardContent>
        <CardFooter className="p-3 flex-col items-start space-y-2">
          <h3 className="font-semibold text-left w-full truncate" title={movie.title}>{movie.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
