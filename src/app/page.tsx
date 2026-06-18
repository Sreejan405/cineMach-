import Header from '@/components/Header';
import MovieSuggestions from '@/components/MovieSuggestions';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Film, Zap } from 'lucide-react';
import RecentlyReleased from '@/components/RecentlyReleased';
import MoodQuestionnaire from '@/components/MoodQuestionnaire';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

const stats = [
  { icon: Film, label: 'Movies', value: '10,000+' },
  { icon: Sparkles, label: 'AI-Powered', value: 'Genkit' },
  { icon: Zap, label: 'Genres', value: '20+' },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden hero-gradient">
          {/* Decorative orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="float-orb absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
            <div
              className="float-orb absolute top-10 right-0 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"
              style={{ animationDelay: '2s' }}
            />
            <div
              className="float-orb absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-3xl"
              style={{ animationDelay: '4s' }}
            />
            {/* Film reel dots pattern */}
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-fuchsia-400" />
              AI-powered recommendations
            </div>

            <h1 className="text-6xl md:text-8xl font-headline font-bold mb-6 text-white leading-tight">
              Cine
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400">
                Match
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover your next favorite film. Choose your genres, language, and era — and let our AI curate a perfectly tailored list just for you.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-purple-900/40 text-base px-8"
              >
                <a href="#suggestions">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm text-base px-8"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>

            {/* Stats bar */}
            <div className="inline-flex items-center gap-8 md:gap-12 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 backdrop-blur-sm">
              {stats.map(({ icon: Icon, label, value }, i) => (
                <div key={label} className="flex items-center gap-3">
                  {i > 0 && <div className="hidden md:block h-8 w-px bg-white/10" />}
                  <Icon className="h-5 w-5 text-fuchsia-400" />
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">{value}</div>
                    <div className="text-xs text-white/50">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mood Questionnaire ── */}
        <div className="border-t border-white/5">
          <MoodQuestionnaire />
        </div>

        {/* ── Recently Released ── */}
        <Suspense fallback={<RecentReleasesSkeleton />}>
          <RecentlyReleased />
        </Suspense>

        {/* ── AI Suggestions ── */}
        <section id="suggestions" className="container mx-auto px-4 pb-24">
          <MovieSuggestions />
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Film className="h-5 w-5 text-accent" />
                <span className="font-headline font-bold text-lg">CineMatch</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your AI-powered companion for discovering great cinema across every genre and language.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</a></li>
                <li><a href="#suggestions" className="text-muted-foreground hover:text-foreground transition-colors">Get Recommendations</a></li>
                <li><a href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">My Profile</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</a></li>
                <li><a href="/signup" className="text-muted-foreground hover:text-foreground transition-colors">Sign Up</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CineMatch. Movie data provided by{' '}
              <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">TMDB</a>.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
