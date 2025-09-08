
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { handleSummarizePlot } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import { Separator } from './ui/separator';

const defaultPlot = "In a futuristic city, a lone detective uncovers a vast conspiracy that threatens to unravel the fabric of society. He must navigate a world of advanced technology, corporate espionage, and artificial intelligence to find the truth. Along the way, he partners with a renegade android, who questions the very nature of humanity. Together, they face off against a powerful corporation with a sinister plan, leading to a climactic showdown that will determine the fate of both humans and machines.";

export interface SummaryResult {
  summary: string;
}

interface PlotSummarizerProps {
  title: string;
}

export default function PlotSummarizer({ title }: PlotSummarizerProps) {
  const [plot, setPlot] = useState(defaultPlot);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plot) {
      toast({
        title: "No plot provided",
        description: "Please enter a movie plot to summarize.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const result = await handleSummarizePlot({ title, moviePlot: plot });
      if (result.summary) {
        setResult(result);
      } else {
        toast({
          title: "An error occurred",
          description: "Could not summarize the plot. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Could not summarize the plot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-accent" />
            AI Plot Summarizer
        </CardTitle>
        <CardDescription>
          Enter a movie plot below and let our AI create a concise summary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={plot}
            onChange={(e) => setPlot(e.target.value)}
            placeholder="Enter movie plot here..."
            rows={8}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              'Summarize Plot'
            )}
          </Button>
        </form>
        {result?.summary && (
          <div className="space-y-4 pt-4">
            <Separator />
            <div>
              <h4 className="text-lg font-semibold font-headline mb-2">Summary:</h4>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
