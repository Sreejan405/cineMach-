import { SituationAnalysis } from "@/ai/flows/analyze-user-situation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Brain, Smile, Activity, Globe2, Search } from "lucide-react";

interface AnalysisSummaryProps {
  analysis: SituationAnalysis;
}

export default function AnalysisSummary({ analysis }: AnalysisSummaryProps) {
  const languageNames: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ml: "Malayalam",
    mr: "Marathi",
    pt: "Portuguese",
    ru: "Russian",
    ta: "Tamil",
    te: "Telugu",
    bn: "Bengali",
  };

  const displayLanguage = analysis.languageCode
    ? languageNames[analysis.languageCode.toLowerCase()] || analysis.languageCode.toUpperCase()
    : "Any Language";

  return (
    <Card className="border border-fuchsia-500/20 bg-fuchsia-500/5 backdrop-blur-sm shadow-xl max-w-4xl mx-auto mb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl pointer-events-none" />
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-headline font-bold flex items-center gap-2 text-fuchsia-300">
          <Brain className="h-4.5 w-4.5 text-fuchsia-400" />
          AI Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1 p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Smile className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>Mood</span>
            </div>
            <p className="text-sm font-semibold capitalize text-white">
              {analysis.mood}
            </p>
          </div>

          <div className="space-y-1 p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Activity className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>Energy</span>
            </div>
            <p className="text-sm font-semibold capitalize text-white">
              {analysis.energy}
            </p>
          </div>

          <div className="space-y-1 p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Globe2 className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>Language</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {displayLanguage}
            </p>
          </div>

          <div className="space-y-1 p-3 rounded-lg bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Search className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>Looking For</span>
            </div>
            <p className="text-xs font-medium text-white/90 truncate" title={analysis.keywords.join(', ')}>
              {analysis.keywords.length > 0 ? analysis.keywords.join(', ') : 'Feel-good films'}
            </p>
          </div>
        </div>
        
        {analysis.avoid.length > 0 && (
          <div className="mt-3 text-xs text-white/40 flex gap-1.5 items-center px-1">
            <span className="text-red-400 font-semibold">Avoiding:</span>
            <span>{analysis.avoid.join(', ')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
