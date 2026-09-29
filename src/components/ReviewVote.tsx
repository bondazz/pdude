'use client';

import React, { useState } from 'react';
import { Locale } from '@/lib/types';
import { getTranslation } from '@/lib/i18n';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface ReviewVoteProps {
  locale: Locale;
  initialVotes: number;
}

export default function ReviewVote({ locale, initialVotes }: ReviewVoteProps) {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);
  const [votes, setVotes] = useState(initialVotes);

  const handleVote = (type: 'yes' | 'no') => {
    if (voted) return;
    setVoted(type);
    if (type === 'yes') {
      setVotes(votes + 1);
    }
  };

  return (
    <div
      style={{
        marginTop: 24,
        padding: '16px 20px',
        background: 'var(--bg-card-alt)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        border: '1px solid var(--border-light)',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 14 }}>
        {getTranslation(locale, 'userHelpful')}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {voted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: 13 }}>
            <Check size={16} />
            <span>Thank you for your feedback! ({votes.toLocaleString()} users found this helpful)</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleVote('yes')}
              className="theme-btn"
              style={{ padding: '6px 14px', background: 'var(--bg-card)' }}
            >
              <ThumbsUp size={14} style={{ color: '#10b981' }} />
              <span>{getTranslation(locale, 'yes')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleVote('no')}
              className="theme-btn"
              style={{ padding: '6px 14px', background: 'var(--bg-card)' }}
            >
              <ThumbsDown size={14} style={{ color: '#ef4444' }} />
              <span>{getTranslation(locale, 'no')}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
