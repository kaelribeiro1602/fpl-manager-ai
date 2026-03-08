'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight, Brain, AlertCircle } from 'lucide-react';

interface Recommendation {
  player_out: string;
  player_in: string;
  reasoning: string;
}

export default function AIRecommendations({ managerId }: { managerId: string }) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getRecommendation = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/recommend-transfer/${managerId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'AI failed to generate a suggestion');
      }
      const data = await res.json();
      
      // The backend returns a string inside "recommendation", usually with a JSON block
      const content = data.recommendation;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setRecommendation(jsonArrayToObj(JSON.parse(jsonMatch[0])));
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to ensure we get the right format
  const jsonArrayToObj = (json: any) => {
    if (Array.isArray(json)) return json[0];
    return json;
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">AI Transfer Advisor</h3>
        </div>
        <button
          onClick={getRecommendation}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 text-sm font-medium transition-all flex items-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Thinking...</span>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Get Suggestion
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md flex items-start gap-2 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {recommendation && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 bg-muted/30 p-4 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Sell</p>
              <div className="bg-primary/10 text-primary px-4 py-2 rounded border border-primary/20 font-bold">
                {recommendation.player_out}
              </div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-muted-foreground hidden sm:block" />
            
            <div className="text-center">
              <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Buy</p>
              <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded border border-secondary/20 font-bold">
                {recommendation.player_in}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Brain className="w-3 h-3" />
              AI Reasoning
            </p>
            <p className="text-sm leading-relaxed italic text-foreground/80">
              "{recommendation.reasoning}"
            </p>
          </div>
        </div>
      )}
      
      {!recommendation && !loading && !error && (
        <p className="text-sm text-muted-foreground text-center py-4 italic">
          Tap the button to let the AI analyze your squad form and fixture difficulty.
        </p>
      )}
    </div>
  );
}
