import Header from '@/components/Header';
import MovieSuggestions from '@/components/MovieSuggestions';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import RecentlyReleased from '@/components/RecentlyReleased';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function RecentReleasesSkeleton() {
    return (
        <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-headline text-center font-bold mb-8">Recently Released</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                        <Skeleton className="h-[300px] w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                ))}
            </div>
        </section>
    );
}


export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            CineMatch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover your next favorite film. Select your preferred genres and let our AI curate a personalized list of movie recommendations just for you.
          </p>
          <div className="flex justify-center gap-4">
             <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <a href="#suggestions">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
          </div>
        </section>

        <Suspense fallback={<RecentReleasesSkeleton />}>
          <RecentlyReleased />
        </Suspense>

        <section id="suggestions" className="container mx-auto px-4 pb-24">
          <MovieSuggestions />
        </section>
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CineMatch. All rights reserved.</p>
      </footer>
    </>
  );
}
