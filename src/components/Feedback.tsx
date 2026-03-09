"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Star, Check } from "lucide-react";

interface FeedbackProps {
  generationId?: string;
}

export default function Feedback({ generationId }: FeedbackProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!generationId) return null;

  const handleSubmit = async (selectedRating: number) => {
    if (loading || submitted) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          rating: selectedRating
        })
      });

      if (response.ok) {
        setRating(selectedRating);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400 mt-4">
        <Check className="h-4 w-4" />
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-700">
      <p className="text-sm text-slate-400 mb-2">How was this result?</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleSubmit(star)}
            disabled={loading}
            className={`p-1 transition-colors ${
              rating && star <= rating 
                ? 'text-yellow-400' 
                : 'text-slate-600 hover:text-yellow-400'
            }`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="text-xs text-slate-500 ml-2">
          {rating ? `${rating}/5` : 'Rate this output'}
        </span>
      </div>
    </div>
  );
}
