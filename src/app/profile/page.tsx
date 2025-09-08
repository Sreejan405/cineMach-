
"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Tag, Heart } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function ProfilePage() {
  const { user } = useUser();

  if (!user) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
            <p>Please log in to view your profile.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-primary rounded-full">
                <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <div>
                <h1 className="text-4xl font-headline font-bold">My Profile</h1>
                <p className="text-muted-foreground">Manage your preferences and saved movies.</p>
            </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Tag className="h-5 w-5 text-accent" />
                Favorite Genres
              </CardTitle>
              <CardDescription>
                These genres help us tailor recommendations for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.favoriteGenres.map((genre) => (
                  <div key={genre} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium">
                    {genre}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Heart className="h-5 w-5 text-accent" />
                Saved Movies
              </CardTitle>
              <CardDescription>
                Your personal collection of movies to watch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.savedMovies.map((movie, index) => (
                <div key={movie}>
                  <p className="font-semibold">{movie}</p>
                  {index < user.savedMovies.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
