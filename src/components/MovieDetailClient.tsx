
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Heart, ArrowLeft } from "lucide-react";
import { handleGetTrailer } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";

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

interface MovieDetailClientProps {
    title: string;
    rating: number | null;
    overview?: string | null;
    cast?: CastMember[];
    director?: CrewMember | null;
    productionCompanies?: ProductionCompany[];
}

export function MovieDetailClient({ title, rating, overview, cast = [], director, productionCompanies = [] }: MovieDetailClientProps) {
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
    const [isLoadingTrailer, setIsLoadingTrailer] = useState(true);
    const { toast } = useToast();
    const { user, isMovieSaved, saveMovie, unsaveMovie } = useUser();
    const router = useRouter();

    const hasRefreshed = useRef(false);

    useEffect(() => {
        if (cast.length === 0 && !hasRefreshed.current) {
            hasRefreshed.current = true;
            router.refresh();
        }
    }, [cast, router]);

    const isSaved = isMovieSaved(title);

    const handleSaveToggle = () => {
        if (!user) {
            toast({
                title: "Please log in",
                description: "You need to be logged in to save movies.",
                variant: "destructive"
            });
            return;
        }

        if (isSaved) {
            unsaveMovie(title);
            toast({
                title: "Removed from watchlist",
                description: `${title} has been removed from your saved movies.`
            });
        } else {
            saveMovie(title);
            toast({
                title: "Added to watchlist! 🎬",
                description: `${title} has been saved to your profile.`
            });
        }
    };

    useEffect(() => {
        const fetchTrailer = async () => {
            setIsLoadingTrailer(true);
            try {
                const url = await handleGetTrailer(title);
                setTrailerUrl(url);
            } catch (error) {
                console.error("Error fetching trailer:", error);
            } finally {
                setIsLoadingTrailer(false);
            }
        };

        fetchTrailer();
    }, [title]);


    return (
        <div className="flex flex-col h-full">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>

            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-3 leading-tight">{title}</h1>

                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    {rating !== null && (
                        <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-3 py-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-400">{rating.toFixed(1)} / 10</span>
                        </div>
                    )}

                    {isLoadingTrailer ? (
                        <Button className="bg-accent hover:bg-accent/90" disabled size="sm">
                            Loading trailer...
                        </Button>
                    ) : trailerUrl ? (
                        <Button asChild className="bg-accent hover:bg-accent/90" size="sm">
                            <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
                                ▶ Watch Trailer
                                <ExternalLink className="ml-2 h-3.5 w-3.5" />
                            </a>
                        </Button>
                    ) : null}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveToggle}
                        className={isSaved ? 'border-red-400/50 text-red-400 hover:bg-red-400/10' : ''}
                    >
                        <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-red-400 text-red-400' : ''}`} />
                        {isSaved ? 'Saved' : 'Save'}
                    </Button>
                </div>

                <div className="h-px bg-border/50 mb-6" />

                {overview && (
                    <div className="mb-6">
                        <h2 className="text-lg font-headline font-semibold mb-2 text-foreground/90">About this movie</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{overview}</p>
                    </div>
                )}

                {/* Director */}
                {director && (
                  <div className="mb-6">
                    <h2 className="text-lg font-headline font-semibold mb-3 text-foreground/90">Director</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10 flex-shrink-0">
                        {director.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${director.profile_path}`}
                            alt={director.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                            {director.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{director.name}</p>
                        <p className="text-xs text-muted-foreground">Director</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cast */}
                {cast.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-headline font-semibold mb-3 text-foreground/90">Cast</h2>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {cast.map((member) => (
                        <div key={member.id} className="flex-shrink-0 w-20 text-center">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10 mx-auto mb-1">
                            {member.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                                {member.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-foreground leading-tight line-clamp-1">{member.name}</p>
                          <p className="text-xs text-muted-foreground leading-tight line-clamp-1">{member.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Production Companies */}
                {productionCompanies.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-headline font-semibold mb-3 text-foreground/90">Production</h2>
                    <div className="flex flex-wrap gap-4">
                      {productionCompanies.map((company) => (
                        <div key={company.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                          {company.logo_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                              alt={company.name}
                              className="h-5 object-contain brightness-0 invert opacity-70"
                            />
                          ) : (
                            <p className="text-xs text-muted-foreground">{company.name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
        </div>
    )
}
