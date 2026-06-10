import Link from "next/link";
import { UserAuthForm } from "@/components/UserAuthForm";
import { Film, Star, Sparkles } from "lucide-react";

const quote = {
  text: "Every great film should seem new every time you see it.",
  author: "Roger Ebert",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left panel — cinematic */}
      <div className="relative hidden md:flex flex-col justify-between p-12 hero-gradient overflow-hidden">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="float-orb absolute top-10 right-10 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
          <div
            className="float-orb absolute bottom-20 left-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <Film className="h-7 w-7 text-fuchsia-400" />
          <span className="font-headline font-bold text-2xl text-white">CineMatch</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div className="flex gap-1.5 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-fuchsia-400 text-fuchsia-400" />
            ))}
          </div>
          <blockquote>
            <p className="text-2xl font-headline font-bold text-white leading-snug">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="mt-3 text-sm text-white/50">— {quote.author}</footer>
          </blockquote>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Sparkles className="h-4 w-4 text-fuchsia-400" />
            Join thousands discovering great cinema
          </div>
        </div>

        <div className="relative text-xs text-white/30">
          © {new Date().getFullYear()} CineMatch
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          <Film className="h-6 w-6 text-accent" />
          <span className="font-headline font-bold text-xl">CineMatch</span>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-headline font-bold mb-1">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Start discovering movies tailored to your taste.
            </p>
          </div>

          <UserAuthForm mode="signup" />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:text-accent/80 underline underline-offset-4 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
