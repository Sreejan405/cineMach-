'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import MovieCard from '@/components/MovieCard';
import { handleMoodMovies } from '@/app/actions';
import { handleDescriptionMovies } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, Smile, Zap, Palette, ArrowRight, ArrowLeft,
  RefreshCw, MessageSquare, ListChecks, Sparkles, Send, Brain
} from 'lucide-react';
import Link from 'next/link';
import type { Movie } from '@/services/tmdb';
import { SituationAnalysis } from '@/ai/flows/analyze-user-situation';
import AnalysisSummary from './AnalysisSummary';

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
type Mode = 'quiz' | 'describe';

// ─── Shared results panel ────────────────────────────────────────────────────

function ResultsPanel({
  movies,
  genres,
  reasoning,
  analysis,
  onReset,
}: {
  movies: Movie[];
  genres: string[];
  reasoning?: string;
  analysis?: SituationAnalysis;
  onReset: () => void;
}) {
  return (
    <>
      {analysis && <AnalysisSummary analysis={analysis} />}
      {/* Result header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-headline font-bold text-white">
            Your AI Picks
          </h3>
          {genres.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Based on: {genres.join(' · ')}
            </p>
          )}
          {reasoning && (
            <p className="text-xs text-fuchsia-300/80 mt-1 italic max-w-md">
              ✦ {reasoning}
            </p>
          )}
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>

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
          <p>No movies found. Try a different description!</p>
          <button
            onClick={onReset}
            className="mt-4 flex items-center gap-1.5 mx-auto text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Start over
          </button>
        </div>
      )}
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MoodQuestionnaire() {
  const [mode, setMode] = useState<Mode>('quiz');

  // ── Quiz state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [quizMovies, setQuizMovies] = useState<Movie[]>([]);
  const [quizGenres, setQuizGenres] = useState<string[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  // ── Describe state ─────────────────────────────────────────────────────────
  const [description, setDescription] = useState('');
  const [descMovies, setDescMovies] = useState<Movie[]>([]);
  const [descGenres, setDescGenres] = useState<string[]>([]);
  const [descReasoning, setDescReasoning] = useState('');
  const [descAnalysis, setDescAnalysis] = useState<SituationAnalysis | null>(null);
  const [descLoading, setDescLoading] = useState(false);
  const [descDone, setDescDone] = useState(false);

  const { toast } = useToast();

  const quickSuggestions = [
    { label: '😴 Exhausted after work', text: "I had a long day at work. I'm exhausted. I just want something relaxing. I prefer Hindi movies." },
    { label: '❤️ Date night', text: "It's date night. We want a romantic, engaging movie to watch together, maybe a rom-com or an emotional drama." },
    { label: '👨‍👩‍👧 Family movie night', text: "We're having a family movie night. Looking for a wholesome, entertaining family or animation movie that everyone can enjoy." },
    { label: '😂 Need a comedy', text: "I'm in the mood for a good laugh! Recommend a hilarious comedy or a feel-good, light-hearted film." },
    { label: '😭 Want to cry', text: "I want an emotional tear-jerker. A deeply moving, tragic, or bittersweet drama that will make me cry." },
    { label: '🚀 Mind-bending sci-fi', text: "Give me something completely mind-bending. A sci-fi or mystery thriller with high stakes and a puzzle plot." },
    { label: '💪 Need motivation', text: "I need some motivation. Show me an inspiring, uplifting story of triumph, personal growth, or historical significance." },
    { label: '🎓 Student stress', text: "I'm stressed out from studying. I need an easy, low-stress, fun movie to decompress and clear my mind." }
  ];

  const handleQuickSuggestion = (text: string) => {
    setDescription(text);
    setTimeout(() => {
      const textarea = document.getElementById('mood-description');
      if (textarea) {
        textarea.focus();
      }
    }, 50);
  };
  const currentQ = questions[step];

  // ── Quiz handlers ──────────────────────────────────────────────────────────

  const handleSelect = async (label: string) => {
    const qId = currentQ.id as QuestionId;
    const updatedAnswers = { ...answers, [qId]: label };
    setAnswers(updatedAnswers);

    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      setQuizLoading(true);
      setQuizDone(true);
      try {
        const result = await handleMoodMovies({
          feeling:    updatedAnswers.feeling    ?? '',
          experience: updatedAnswers.experience ?? '',
          vibe:       updatedAnswers.vibe       ?? '',
        });
        setQuizMovies(result.movies);
        setQuizGenres(result.genres);
      } catch {
        toast({ title: 'Error', description: 'Could not fetch movies. Try again.', variant: 'destructive' });
        setQuizMovies([]);
      } finally {
        setQuizLoading(false);
      }
    }
  };

  const handleBack = () => { if (step > 0) setStep(s => s - 1); };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setQuizMovies([]);
    setQuizGenres([]);
    setQuizDone(false);
  };

  // ── Describe handlers ──────────────────────────────────────────────────────

  const handleDescribeSubmit = async () => {
    const trimmed = description.trim();
    if (trimmed.length < 10) {
      toast({ title: 'Too short', description: 'Please describe a bit more so our AI can help!', variant: 'destructive' });
      return;
    }
    setDescLoading(true);
    setDescDone(true);
    try {
      const result = await handleDescriptionMovies({ description: trimmed });
      setDescMovies(result.movies);
      setDescGenres(result.genres);
      setDescReasoning(result.reasoning);
      if (result.analysis) {
        setDescAnalysis(result.analysis);
      }
    } catch {
      toast({ title: 'Error', description: 'AI could not process your description. Try again.', variant: 'destructive' });
      setDescMovies([]);
    } finally {
      setDescLoading(false);
    }
  };

  const resetDescribe = () => {
    setDescription('');
    setDescMovies([]);
    setDescGenres([]);
    setDescReasoning('');
    setDescAnalysis(null);
    setDescDone(false);
  };

  // ── Mode switch (resets state) ─────────────────────────────────────────────

  const switchMode = (m: Mode) => {
    setMode(m);
    resetQuiz();
    resetDescribe();
  };

  // ── Progress (quiz mode only) ──────────────────────────────────────────────
  const progressPct = quizDone ? 100 : (step / questions.length) * 100;

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
          Answer 3 quick questions or just describe your situation — our AI will handle the rest.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm w-fit mx-auto">
          <button
            onClick={() => switchMode('quiz')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === 'quiz'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-purple-900/30'
                : 'text-white/50 hover:text-white'
              }`}
          >
            <ListChecks className="h-4 w-4" />
            Quick Quiz
          </button>
          <button
            onClick={() => switchMode('describe')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${mode === 'describe'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-purple-900/30'
                : 'text-white/50 hover:text-white'
              }`}
          >
            <MessageSquare className="h-4 w-4" />
            Describe It
          </button>
        </div>
      </div>

      {/* Card area */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ── QUIZ MODE ─────────────────────────────────────────────────── */}
          {mode === 'quiz' && (
            <motion.div
              key="quiz-mode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Progress bar */}
              {!quizDone && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Question {step + 1} of {questions.length}</span>
                    <span>{Math.round(progressPct)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Question step */}
                {!quizDone && (
                  <motion.div
                    key={`question-${step}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-500/20 text-fuchsia-400">
                        <currentQ.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-headline font-bold text-white">
                        {currentQ.question}
                      </h3>
                    </div>

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

                {/* Results */}
                {quizDone && (
                  <motion.div
                    key="quiz-results"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {quizLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                        <Loader2 className="h-10 w-10 animate-spin text-fuchsia-400" />
                        <p className="text-sm">Matching your mood to movies…</p>
                      </div>
                    ) : (
                      <ResultsPanel
                        movies={quizMovies}
                        genres={quizGenres}
                        onReset={resetQuiz}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── DESCRIBE MODE ─────────────────────────────────────────────── */}
          {mode === 'describe' && (
            <motion.div
              key="describe-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <AnimatePresence mode="wait">
                {/* Input form */}
                {!descDone && (
                  <motion.div
                    key="describe-input"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8"
                  >
                    {/* Heading */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-500/20 text-fuchsia-400">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-headline font-bold text-white">
                        🎬 Tell us about your movie night
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 ml-13">
                      Tell our AI what you're in the mood for — your vibe, a theme, a feeling, or even a specific scenario. The more detail, the better.
                    </p>

                    {/* Textarea */}
                    <div className="relative">
                      <textarea
                        id="mood-description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleDescribeSubmit();
                        }}
                        rows={5}
                        maxLength={500}
                        placeholder={`e.g. "I had a long day at work. I'm exhausted. I just want something relaxing. I prefer Hindi movies."`}
                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 text-sm p-4 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 transition-all duration-200 leading-relaxed"
                      />
                      <span className="absolute bottom-3 right-3 text-xs text-white/30 select-none">
                        {description.length}/500
                      </span>
                    </div>

                    {/* Quick Suggestions */}
                    <div className="mt-4 mb-6">
                      <p className="text-xs text-white/40 mb-2 font-medium">Quick Suggestions:</p>
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                        {quickSuggestions.map(sug => (
                          <button
                            key={sug.label}
                            type="button"
                            onClick={() => handleQuickSuggestion(sug.text)}
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10 transition-all duration-150"
                          >
                            {sug.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit button */}
                    <Button
                      onClick={handleDescribeSubmit}
                      disabled={description.trim().length < 10}
                      size="lg"
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 shadow-lg shadow-purple-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Find My Movies
                      <span className="ml-2 text-xs opacity-60">(or Ctrl+Enter)</span>
                    </Button>
                  </motion.div>
                )}

                {/* Results */}
                {descDone && (
                  <motion.div
                    key="describe-results"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {descLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                        <div className="relative">
                          <Loader2 className="h-10 w-10 animate-spin text-fuchsia-400" />
                          <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
                        </div>
                        <p className="text-sm">Our AI is reading your vibe…</p>
                        <p className="text-xs text-white/30">Analysing your description and curating picks</p>
                      </div>
                    ) : (
                      <ResultsPanel
                        movies={descMovies}
                        genres={descGenres}
                        reasoning={descReasoning}
                        analysis={descAnalysis || undefined}
                        onReset={resetDescribe}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
