
"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Film, X, LogIn } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";

export default function ProfilePage() {
  const { user, unsaveMovie } = useUser();

  if (!user) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center gap-6">
          <div className="h-20 w-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <LogIn className="h-10 w-10 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold mb-2">Not logged in</h1>
            <p className="text-muted-foreground max-w-xs">
              Please sign in to view your profile and saved movie list.
            </p>
          </div>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="/login">Go to Login</Link>
          </Button>
        </main>
      </>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Profile header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold font-headline shadow-lg shadow-purple-900/30">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </div>

        {/* Saved Movies */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
              <Heart className="h-5 w-5 text-accent" />
              Saved Movies
              {user.savedMovies.length > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground bg-secondary rounded-full px-2.5 py-0.5">
                  {user.savedMovies.length}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Your personal collection of movies to watch later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.savedMovies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No saved movies yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Browse movies and click the Save button to add them here.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/#suggestions">Find Movies</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {user.savedMovies.map((movie) => (
                  <li
                    key={movie}
                    className="flex items-center justify-between py-3 group"
                  >
                    <Link
                      href={`/movie/${encodeURIComponent(movie)}`}
                      className="font-medium text-sm hover:text-accent transition-colors flex-1 mr-4 truncate"
                    >
                      {movie}
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => unsaveMovie(movie)}
                      aria-label={`Remove ${movie}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
