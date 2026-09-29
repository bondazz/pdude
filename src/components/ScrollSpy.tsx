'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function ScrollSpy() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isBottom, setIsBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const percent = Math.min(Math.max(scrollTop / docHeight, 0), 1);
        setScrollPercent(percent);
        setIsBottom(percent > 0.85);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (isBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - scrollPercent * circumference;

  return (
    <div
      className="scrollspy-btn scrollspy-btn-fixed"
      style={{ '--percent': `${Math.round(scrollPercent * 100)}%` } as any}
      onClick={handleClick}
      title={isBottom ? 'Scroll to Top' : 'Scroll to Bottom'}
      role="button"
      tabIndex={0}
      aria-label="Scroll Navigator"
    >
      <svg className="scrollspy-btn-circles" xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
        <circle className="scrollspy-btn-circle" r="20" cx="22" cy="22" strokeWidth="3" />
        <circle
          className="scrollspy-btn-progress-bar"
          r="20"
          cx="22"
          cy="22"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span className="scrollspy-icon">
        {isBottom ? <ArrowUp size={18} color="#fff" /> : <ArrowDown size={18} color="#fff" />}
      </span>
    </div>
  );
}
