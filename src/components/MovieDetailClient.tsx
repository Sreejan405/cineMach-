
"use client";

import { useState, useEffect } from "react";
import PlotSummarizer from "@/components/PlotSummarizer";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Heart } from "lucide-react";
import { handleGetTrailer } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

interface MovieDetailClientProps {
    title: string;
    rating: number | null;
}

export function MovieDetailClient({ title, rating }: MovieDetailClientProps) {
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
    const [isLoadingTrailer, setIsLoadingTrailer] = useState(true);
    const { toast } = useToast();
    const { user, isMovieSaved, saveMovie, unsaveMovie } = useUser();

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
                title: "Movie unsaved",
                description: `${title} has been removed from your list.`
            });
        } else {
            saveMovie(title);
             toast({
                title: "Movie Saved!",
                description: `${title} has been added to your profile.`
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
                toast({
                    title: "Could not fetch trailer",
                    description: "An error occurred while fetching the movie trailer.",
                    variant: "destructive"
                })
            } finally {
                setIsLoadingTrailer(false);
            }
        };

        fetchTrailer();
    }, [title, toast]);


    return (
        <div className="flex flex-col h-full">
            <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">{title}</h1>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                    {rating !== null && (
                      <div className="flex items-center gap-2 text-lg text-muted-foreground">
                        <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                        <span>{rating.toFixed(1)} / 10</span>
                      </div>
                    )}
                    {isLoadingTrailer ? (
                         <Button className="bg-accent hover:bg-accent/90" disabled>
                            Loading Trailer...
                        </Button>
                    ) : trailerUrl ? (
                        <Button asChild className="bg-accent hover:bg-accent/90">
                            <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
                                Watch Trailer
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    ) : null}
                    <Button variant="outline" onClick={handleSaveToggle}>
                        <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        {isSaved ? 'Unsave' : 'Save'}
                    </Button>
                </div>
                <p className="text-lg text-muted-foreground">AI-Powered Plot Summary</p>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <p className="text-muted-foreground text-base">
                    On this page, you can see a demonstration of our AI-powered plot summarizer. Enter any movie plot (we've filled in a default one for you) and our AI will generate a concise summary.
                </p>
            </div>
            <div className="mt-auto">
             <PlotSummarizer title={title} />
            </div>
        </div>
    )
}
