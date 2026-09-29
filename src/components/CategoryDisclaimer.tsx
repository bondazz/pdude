'use client';

import React, { useState } from 'react';

interface CategoryDisclaimerProps {
  disclaimerText: string;
}

export default function CategoryDisclaimer({ disclaimerText }: CategoryDisclaimerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="portal-disclaimer-box">
      <p className="portal-disclaimer-text">
        <strong className="portal-disclaimer-label">Editorial Disclaimer: </strong>
        {expanded ? disclaimerText : `${disclaimerText.slice(0, 195)}... `}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="portal-disclaimer-toggle"
        >
          {expanded ? 'Read Less' : 'Read More'}
        </button>
      </p>
    </div>
  );
}
