'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import MovieCard from '@/components/MovieCard';
import { handleMoodMovies } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Smile, Zap, Palette, ArrowRight, ArrowLeft,
  RefreshCw, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import type { Movie } from '@/services/tmdb';

// ─── Question Definitions ───────────────────────────────────────────────────

const questions = [
  {
    id: 'feeling',
    icon: Smile,
    question: 'How are you feeling right now?',
    options: [
      { label: 'Happy',        emoji: '😊' },
      { label: 'Sad',          emoji: '😢' },
      { label: 'Stressed',     emoji: '😰' },
      { label: 'Bored',        emoji: '😑' },
      { label: 'Romantic',     emoji: '💕' },
      { label: 'Adventurous',  emoji: '🧗' },
    ],
  },
  {
    id: 'experience',
    icon: Zap,
    question: 'What kind of experience do you want?',
    options: [
      { label: 'Make me laugh',    emoji: '😂' },
      { label: 'Keep me on edge',  emoji: '😬' },
      { label: 'Make me think',    emoji: '🤔' },
      { label: 'Inspire me',       emoji: '✨' },
      { label: 'Scare me',         emoji: '👻' },
    ],
  },
  {
    id: 'vibe',
    icon: Palette,
    question: 'Pick a vibe',
    options: [
      { label: 'Light & easy',      emoji: '🌤️' },
      { label: 'Deep & meaningful', emoji: '🌊' },
      { label: 'Action-packed',     emoji: '💥' },
      { label: 'Slow burn',         emoji: '🕯️' },
    ],
  },
] as const;

type QuestionId = (typeof questions)[number]['id'];

// ─── Component ───────────────────────────────────────────────────────────────

export default function MoodQuestionnaire() {
  const [step, setStep] = useState(0);                // 0-2 = questions, 3 = results
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [movies, setMovies] = useState<Movie[]>([]);
  const [resultGenres, setResultGenres] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentQ = questions[step];

  const handleSelect = async (label: string) => {
    const qId = currentQ.id as QuestionId;
    const updatedAnswers = { ...answers, [qId]: label };
    setAnswers(updatedAnswers);

    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      // Last question answered — fetch results
      setIsLoading(true);
      setStep(questions.length); // move to results view
      try {
        const result = await handleMoodMovies({
          feeling:    updatedAnswers.feeling    ?? '',
          experience: updatedAnswers.experience ?? '',
          vibe:       updatedAnswers.vibe       ?? '',
        });
        setMovies(result.movies);
        setResultGenres(result.genres);
      } catch {
        toast({ title: 'Error', description: 'Could not fetch movies. Try again.', variant: 'destructive' });
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setMovies([]);
    setResultGenres([]);
  };

  // URL for "See full list" — pre-fills genres on the suggestions page
  const fullListUrl = resultGenres.length
    ? `/#suggestions?genres=${encodeURIComponent(resultGenres.join(','))}`
    : '/#suggestions';

  // ── Progress bar ──────────────────────────────────────────────────────────
  const progressPct = step >= questions.length ? 100 : (step / questions.length) * 100;

  return (
    <section className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-sm text-fuchsia-300 mb-4">
          <Palette className="h-4 w-4" />
          Mood-based discovery
        </div>
        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-2 text-white">
          Find Movies for Your Mood
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Answer 3 quick questions and let our AI match you with the perfect films.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        {step < questions.length && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Question {step + 1} of {questions.length}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: `${((step) / questions.length) * 100}%` }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}

        {/* Question steps */}
        <AnimatePresence mode="wait">
          {step < questions.length && (
            <motion.div
              key={`question-${step}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8"
            >
              {/* Question heading */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-500/20 text-fuchsia-400">
                  <currentQ.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-headline font-bold text-white">
                  {currentQ.question}
                </h3>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentQ.options.map(opt => {
                  const isSelected = answers[currentQ.id] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect(opt.label)}
                      className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 text-sm font-medium
                        ${isSelected
                          ? 'border-fuchsia-500 bg-fuchsia-500/20 text-white shadow-lg shadow-fuchsia-900/30'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10 hover:text-white'
                        }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span>{opt.label}</span>
                      {isSelected && (
                        <motion.div
                          layoutId="selected-ring"
                          className="absolute inset-0 rounded-xl ring-2 ring-fuchsia-500"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Back button */}
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="mt-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </motion.div>
          )}

          {/* Results view */}
          {step >= questions.length && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-fuchsia-400" />
                  <p className="text-sm">Matching your mood to movies…</p>
                </div>
              ) : (
                <>
                  {/* Result header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-headline font-bold text-white">
                        Your Mood Matches
                      </h3>
                      {resultGenres.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on: {resultGenres.join(' · ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  </div>

                  {/* Movie cards */}
                  {movies.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                        {movies.map((movie, i) => (
                          <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                          >
                            <MovieCard movie={movie} />
                          </motion.div>
                        ))}
                      </div>

                      {/* See full list CTA */}
                      <div className="text-center">
                        <Link href="/#suggestions">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-purple-900/30"
                          >
                            See Full List
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No movies found for your mood. Try different answers!</p>
                      <button
                        onClick={handleReset}
                        className="mt-4 flex items-center gap-1.5 mx-auto text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Start over
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
