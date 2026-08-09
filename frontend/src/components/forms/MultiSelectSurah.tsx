'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { surahList } from 'shared';

interface MultiSelectSurahProps {
  selectedSurahs: number[];
  onChange: (surahs: number[]) => void;
  disabled?: boolean;
}

export function MultiSelectSurah({ selectedSurahs, onChange, disabled }: MultiSelectSurahProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSurahs = surahList.filter((s) => 
    s.latinName.toLowerCase().includes(search.toLowerCase()) || 
    s.name.includes(search) || 
    s.number.toString().includes(search)
  );

  const toggleSurah = (num: number) => {
    if (selectedSurahs.includes(num)) {
      onChange(selectedSurahs.filter((n) => n !== num));
    } else {
      onChange([...selectedSurahs, num]);
    }
  };

  const selectAll = () => {
    onChange(surahList.map(s => s.number));
  };

  const clearAll = () => {
    onChange([]);
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

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] px-4 py-2 rounded-xl border border-input bg-background text-foreground text-sm flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all cursor-pointer disabled:opacity-50"
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {selectedSurahs.length === 0 ? (
            <span className="text-muted-foreground/80">-- Pilih Surat yang Dihafal --</span>
          ) : (
            <>
              {selectedSurahs.length <= 3 ? (
                selectedSurahs.map(num => {
                  const surah = surahList.find(s => s.number === num);
                  return (
                    <span key={num} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                      {surah?.latinName}
                      <X 
                        className="w-3 h-3 hover:text-rose-500 cursor-pointer ml-1" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSurah(num);
                        }} 
                      />
                    </span>
                  );
                })
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold">
                  {selectedSurahs.length} Surat Terpilih
                </span>
              )}
            </>
          )}
        </div>
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
                  placeholder="Cari surat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                >
                  Batal Semua
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto p-1 py-1.5 custom-scrollbar">
              {filteredSurahs.map((surah) => {
                const isSelected = selectedSurahs.includes(surah.number);
                return (
                  <div
                    key={surah.number}
                    onClick={() => toggleSurah(surah.number)}
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
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
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
