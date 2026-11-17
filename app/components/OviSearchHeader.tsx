import React, { useState, useEffect } from 'react';

const QUICK_TAGS = [
  { id: 'period', label: '🩸 My Period & Flow', query: 'I just want to understand my period' },
  { id: 'pain', label: '😣 Pain & Cramps', query: 'Why is my stomach paining me?' },
  { id: 'discharge', label: '💧 Discharge & Hygiene', query: 'Is discharge normal?' },
  { id: 'safety', label: '🩺 Ovulation & Safety', query: 'What is ovulation?' },
  { id: 'myths', label: '🌿 Food & Local Myths', query: 'Does garri, cold water, or sweet things stop periods or cause cramps?' },
  { id: 'relationships', label: '🫂 Relationships & Peace', query: 'How do I know if a guy genuinely cares about me?' },
  { id: 'soft', label: '💜 Soft Place', query: 'How can I feel better right now?' },
];

const PLACEHOLDERS = [
  "Search for your period dates, cramps, or body questions...",
  "Ask Ovi anything about your cycle, your body, or your peace...",
  "Type what is on your mind... you are safe here 💜",
  "Search 'late period', 'discharge', 'cramps', or 'safe sex'...",
  "What are you wondering about today, love?"
];

interface OviSearchHeaderProps {
  onSelectQuery: (query: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const OviSearchHeader: React.FC<OviSearchHeaderProps> = ({
  onSelectQuery,
  searchTerm,
  setSearchTerm,
}) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Collapsed: small bar only, does not block chat
  if (!isOpen) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2 bg-white text-left px-4 py-2.5 rounded-full border border-purple-200 shadow-sm text-sm text-purple-400"
        >
          <span>🔍</span>
          <span className="flex-1 truncate">{PLACEHOLDERS[placeholderIndex]}</span>
          <span className="text-purple-600 text-xs font-medium shrink-0">Topics ↓</span>
        </button>
      </div>
    );
  }

  // Expanded: full search + tags
  return (
    <div className="w-full max-w-2xl mx-auto p-3 space-y-3 bg-purple-50/80 rounded-2xl border border-purple-100 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-purple-400 text-sm">
            🔍
          </span>
          <input
            autoFocus
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                onSelectQuery(searchTerm);
                setIsOpen(false);
              }
            }}
            placeholder={PLACEHOLDERS[placeholderIndex]}
            className="w-full pl-9 pr-3 py-2.5 bg-white text-gray-800 placeholder-purple-300 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          />
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="shrink-0 px-3 py-2.5 bg-white border border-purple-200 text-purple-700 text-sm font-medium rounded-xl"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag.id}
            onClick={() => {
              onSelectQuery(tag.query);
              setIsOpen(false);
            }}
            className="whitespace-nowrap px-3 py-1.5 bg-white hover:bg-purple-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200 shadow-xs"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};