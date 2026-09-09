'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { surahList } from 'shared';

interface SingleSelectSurahProps {
  value: number;
  onChange: (surahNumber: number) => void;
  disabled?: boolean;
}

export function SingleSelectSurah({ value, onChange, disabled }: SingleSelectSurahProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSurahs = surahList.filter((s) => 
    s.latinName.toLowerCase().includes(search.toLowerCase()) || 
    s.name.includes(search) || 
    s.number.toString().includes(search)
  );

  const selectSurah = (num: number) => {
    onChange(num);
    setIsOpen(false);
    setSearch('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSurah = surahList.find((s) => s.number === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm items-center justify-between ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer disabled:opacity-50"
      >
        <span className="truncate">
          {selectedSurah ? `${selectedSurah.number}. ${selectedSurah.latinName} (${selectedSurah.numberOfAyah} ayat)` : '-- Pilih Surat --'}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-border bg-muted/30">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ketik nama / urutan surat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background/50 text-sm focus-visible:outline-none focus-visible:border-emerald-500"
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-1 py-1.5 custom-scrollbar">
              {filteredSurahs.map((surah) => {
                const isSelected = value === surah.number;
                return (
                  <div
                    key={surah.number}
                    onClick={() => selectSurah(surah.number)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{surah.number}. {surah.latinName}</span>
                      <span className="text-[10px] opacity-70 font-arabic">{surah.name} ({surah.numberOfAyah} ayat)</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isSelected ? 'text-emerald-500' : 'text-transparent'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
              {filteredSurahs.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Surat tidak ditemukan
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
