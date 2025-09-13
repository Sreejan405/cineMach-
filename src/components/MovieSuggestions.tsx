
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MovieCard from '@/components/MovieCard';
import { handleGetSuggestions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Film, Calendar as CalendarIcon, Languages } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { Movie } from '@/services/tmdb';

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Family", "Fantasy", "History",
  "Horror", "Music", "Mystery", "Romance", "Science Fiction",
  "TV Movie", "Thriller", "War", "Western", "Tragedy"
];

const languages = [
    { code: 'bn', name: 'Bengali' },
    { code: 'zh', name: 'Chinese' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'es', name: 'Spanish' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
];

export default function MovieSuggestions() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [language, setLanguage] = useState<string>('en');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const currentYear = new Date().getFullYear();

  const handleGenreChange = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((item) => item !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedGenres.length === 0) {
      toast({
        title: "No genres selected",
        description: "Please select at least one genre to get suggestions.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await handleGetSuggestions({ 
        genres: selectedGenres, 
        language,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      });
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions as Movie[]);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
       setSuggestions([]);
       console.error("Error fetching suggestions:", error);
       
       let description = "Could not fetch movie suggestions. Please try again later.";
       if (error instanceof Error && error.message.includes('TMDB_API_KEY')) {
         description = "The TMDB_API_KEY is missing. Please add it to your .env file and restart the server.";
       }

      toast({
        title: "An error occurred",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Film className="h-6 w-6 text-accent" />
            Find Your Next Movie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-lg font-headline mb-4 block">Select Genres</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={genre}
                      checked={selectedGenres.includes(genre)}
                      onCheckedChange={() => handleGenreChange(genre)}
                    />
                    <label
                      htmlFor={genre}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="language-select" className="text-lg font-headline flex items-center gap-2"><Languages className="h-5 w-5" />Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language-select">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-lg font-headline mb-2 block"><CalendarIcon className="h-5 w-5 inline-block mr-2" />Release After</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                            fromYear={1900}
                            toYear={currentYear}
                            captionLayout="dropdown-buttons"
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label className="text-lg font-headline mb-2 block"><CalendarIcon className="h-5 w-5 inline-block mr-2" />Release Before</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                            fromYear={1900}
                            toYear={currentYear}
                            captionLayout="dropdown-buttons"
                        />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            
            <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Get Movie Suggestions'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {suggestions && (
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {suggestions.length > 0 ? (
              <>
                <h2 className="text-3xl font-headline text-center font-bold">Your AI Recommendations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {suggestions.map((movie, index) => (
                    <MovieCard key={`${movie.title}-${index}`} movie={movie} />
                  ))}
                </div>
              </>
            ) : (
              !isLoading && (
                <div className="text-center text-muted-foreground">
                  <p>No movies were found for your selected criteria.</p>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
