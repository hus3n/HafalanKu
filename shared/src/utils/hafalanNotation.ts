import { surahList, Surah } from '../constants/surahList';
import { juzList, JuzInfo } from '../constants/juzList';

export interface ParsedHafalanItem {
  surahNumber: number;
  surahName: string;
  ayatStart: number;
  ayatEnd: number;
}

// Normalisasi nama surat untuk pencocokan fleksibel
export function normalizeSurahName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^qs\.?\s*/i, '')
    .replace(/^surah?\s*/i, '')
    .replace(/^surat\s*/i, '')
    .replace(/^al[\s\-_']*/i, '')
    .replace(/^asy[\s\-_']*/i, '')
    .replace(/^at[\s\-_']*/i, '')
    .replace(/^an[\s\-_']*/i, '')
    .replace(/^ar[\s\-_']*/i, '')
    .replace(/^az[\s\-_']*/i, '')
    .replace(/^ad[\s\-_']*/i, '')
    .replace(/['`’\-_]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export function findSurahByFlexibleName(input: string): Surah | undefined {
  const trimmed = input.trim();
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 1 && num <= 114) {
    return surahList.find((s) => s.number === num);
  }

  const cleanInput = normalizeSurahName(trimmed);
  if (!cleanInput) return undefined;

  // Exact match on raw latinName
  const exact = surahList.find(
    (s) => s.latinName.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact;

  // Match normalized name
  return surahList.find((s) => normalizeSurahName(s.latinName) === cleanInput);
}

/**
 * Parsing teks notasi cerdas hafalan (contoh: "Juz 30, Al-Mulk - Al-Qalam 21", "An Naba' 11")
 * Menjadi daftar item hafalan terstruktur { surahNumber, surahName, ayatStart, ayatEnd }
 */
export function parseHafalanNotation(text: string): ParsedHafalanItem[] {
  if (!text || !text.trim()) return [];

  const tokens = text
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const resultMap = new Map<number, ParsedHafalanItem>();

  for (const token of tokens) {
    // 1. Pola: "Juz X" atau "Juz X-Y" (contoh: "Juz 30", "Juz 29-30")
    const juzRangeMatch = token.match(/^juz\s*(\d{1,2})(?:\s*[-–—]\s*(\d{1,2}))?$/i);
    if (juzRangeMatch) {
      const startJuz = parseInt(juzRangeMatch[1], 10);
      const endJuz = juzRangeMatch[2] ? parseInt(juzRangeMatch[2], 10) : startJuz;

      const minJuz = Math.max(1, Math.min(startJuz, endJuz));
      const maxJuz = Math.min(30, Math.max(startJuz, endJuz));

      for (let j = minJuz; j <= maxJuz; j++) {
        const info = juzList.find((item) => item.juzNumber === j);
        if (info) {
          for (const sNum of info.surahNumbers) {
            const surah = surahList.find((s) => s.number === sNum);
            if (surah) {
              resultMap.set(sNum, {
                surahNumber: sNum,
                surahName: surah.latinName,
                ayatStart: 1,
                ayatEnd: surah.numberOfAyah,
              });
            }
          }
        }
      }
      continue;
    }

    // 2. Pola Rentang Antar Surat: "Surat A - Surat B [Ayat]" (contoh: "Al-Mulk - Al-Qalam 21")
    const rangeMatch = token.match(/^(.+?)\s*[-–—]\s*(.+)$/);
    if (rangeMatch) {
      const part1 = rangeMatch[1].trim();
      const part2 = rangeMatch[2].trim();

      // Parse part1 (start surah)
      const surah1 = findSurahByFlexibleName(part1);

      // Parse part2 (end surah, possibly with ayat)
      // Contoh part2: "Al-Qalam 21" atau "Al Qalam ayat 21" atau "Al-Qalam"
      const endAyatMatch = part2.match(/^(.+?)(?:\s+(?:ayat\s*)?(\d+))?$/i);
      const endSurahName = endAyatMatch ? endAyatMatch[1].trim() : part2;
      const endAyatNum = endAyatMatch && endAyatMatch[2] ? parseInt(endAyatMatch[2], 10) : undefined;

      const surah2 = findSurahByFlexibleName(endSurahName);

      if (surah1 && surah2) {
        const sStart = Math.min(surah1.number, surah2.number);
        const sEnd = Math.max(surah1.number, surah2.number);

        for (let sNum = sStart; sNum <= sEnd; sNum++) {
          const s = surahList.find((item) => item.number === sNum);
          if (!s) continue;

          let ayatEnd = s.numberOfAyah;
          if (sNum === surah2.number && endAyatNum) {
            ayatEnd = Math.min(endAyatNum, s.numberOfAyah);
          }

          resultMap.set(sNum, {
            surahNumber: sNum,
            surahName: s.latinName,
            ayatStart: 1,
            ayatEnd,
          });
        }
        continue;
      }
    }

    // 3. Pola Single Surat: "An-Naba 11" / "An-Naba' 1-11" / "Al-Baqarah"
    const singleMatch = token.match(/^(.+?)(?:\s+(?:ayat\s*)?(\d+)(?:\s*[-–—]\s*(\d+))?)?$/i);
    if (singleMatch) {
      const surahCandidate = singleMatch[1].trim();
      const num1 = singleMatch[2] ? parseInt(singleMatch[2], 10) : undefined;
      const num2 = singleMatch[3] ? parseInt(singleMatch[3], 10) : undefined;

      const surah = findSurahByFlexibleName(surahCandidate);
      if (surah) {
        let ayatStart = 1;
        let ayatEnd = surah.numberOfAyah;

        if (num1 !== undefined && num2 !== undefined) {
          ayatStart = Math.min(num1, num2);
          ayatEnd = Math.min(Math.max(num1, num2), surah.numberOfAyah);
        } else if (num1 !== undefined) {
          // Format "An-Naba 11" artinya ayat 1 s.d 11
          ayatEnd = Math.min(num1, surah.numberOfAyah);
        }

        resultMap.set(surah.number, {
          surahNumber: surah.number,
          surahName: surah.latinName,
          ayatStart,
          ayatEnd,
        });
      }
    }
  }

  return Array.from(resultMap.values()).sort((a, b) => a.surahNumber - b.surahNumber);
}

/**
 * Meringkas daftar riwayat hafalan santri menjadi teks notasi cerdas untuk tampilan dan ekspor Excel
 * Contoh: "Juz 30, Al-Mulk - Al-Qalam 21"
 */
export function compressHafalanNotation(
  items: Array<{ surahNumber: number; ayatStart?: number; ayatEnd?: number; surahName?: string }>
): string {
  if (!items || items.length === 0) return '-';

  // Map surahNumber -> { surahNumber, ayatStart, ayatEnd }
  const surahMap = new Map<number, { surahNumber: number; ayatStart: number; ayatEnd: number }>();
  for (const item of items) {
    const sInfo = surahList.find((s) => s.number === item.surahNumber);
    if (!sInfo) continue;

    const start = item.ayatStart ?? 1;
    const end = item.ayatEnd ?? sInfo.numberOfAyah;

    const existing = surahMap.get(item.surahNumber);
    if (!existing || end > existing.ayatEnd) {
      surahMap.set(item.surahNumber, {
        surahNumber: item.surahNumber,
        ayatStart: start,
        ayatEnd: end,
      });
    }
  }

  const completedJuzList: number[] = [];
  const leftoverSurahNumbers = new Set<number>(surahMap.keys());

  // 1. Cek Juz yang sudah tuntas (terutama Juz 30, 29, 28, dsb.)
  for (const juz of juzList) {
    const isFullJuz = juz.surahNumbers.every((sNum) => {
      const recorded = surahMap.get(sNum);
      const sInfo = surahList.find((s) => s.number === sNum);
      return recorded && sInfo && recorded.ayatStart === 1 && recorded.ayatEnd >= sInfo.numberOfAyah;
    });

    if (isFullJuz) {
      completedJuzList.push(juz.juzNumber);
      juz.surahNumbers.forEach((sNum) => leftoverSurahNumbers.delete(sNum));
    }
  }

  const resultSegments: string[] = [];

  // Format Juz yang tuntas
  if (completedJuzList.length > 0) {
    // Sort juz
    completedJuzList.sort((a, b) => b - a); // descending misal Juz 30, Juz 29
    completedJuzList.forEach((j) => {
      resultSegments.push(`Juz ${j}`);
    });
  }

  // 2. Format sisa surat
  const sortedLeftovers = Array.from(leftoverSurahNumbers)
    .map((sNum) => surahMap.get(sNum)!)
    .sort((a, b) => a.surahNumber - b.surahNumber);

  let i = 0;
  while (i < sortedLeftovers.length) {
    const current = sortedLeftovers[i];
    const sInfo = surahList.find((s) => s.number === current.surahNumber);
    if (!sInfo) {
      i++;
      continue;
    }

    const isCurrentFull = current.ayatStart === 1 && current.ayatEnd >= sInfo.numberOfAyah;

    // Cek apakah ada rentang berurutan: misal Al-Mulk (67 full) s/d Al-Qalam (68 partial)
    if (isCurrentFull && i + 1 < sortedLeftovers.length) {
      let j = i;
      while (
        j + 1 < sortedLeftovers.length &&
        sortedLeftovers[j + 1].surahNumber === sortedLeftovers[j].surahNumber + 1
      ) {
        const nextSurah = sortedLeftovers[j + 1];
        const nextInfo = surahList.find((s) => s.number === nextSurah.surahNumber);
        const isNextFull = nextInfo && nextSurah.ayatStart === 1 && nextSurah.ayatEnd >= nextInfo.numberOfAyah;
        j++;
        if (!isNextFull) {
          // Stop at first partial
          break;
        }
      }

      if (j > i) {
        const startSurah = sInfo.latinName;
        const endRecord = sortedLeftovers[j];
        const endInfo = surahList.find((s) => s.number === endRecord.surahNumber);
        const isEndFull = endInfo && endRecord.ayatStart === 1 && endRecord.ayatEnd >= endInfo.numberOfAyah;

        if (isEndFull) {
          resultSegments.push(`${startSurah} - ${endInfo?.latinName}`);
        } else {
          resultSegments.push(`${startSurah} - ${endInfo?.latinName} ${endRecord.ayatEnd}`);
        }
        i = j + 1;
        continue;
      }
    }

    // Single surah format
    if (isCurrentFull) {
      resultSegments.push(sInfo.latinName);
    } else if (current.ayatStart === 1) {
      resultSegments.push(`${sInfo.latinName} ${current.ayatEnd}`);
    } else {
      resultSegments.push(`${sInfo.latinName} ${current.ayatStart}-${current.ayatEnd}`);
    }
    i++;
  }

  return resultSegments.join(', ') || '-';
}
