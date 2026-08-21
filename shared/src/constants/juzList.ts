export interface JuzInfo {
  juzNumber: number;
  name: string;
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  surahNumbers: number[];
}

export const juzList: JuzInfo[] = [
  { juzNumber: 1, name: "Juz 1", startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141, surahNumbers: [1, 2] },
  { juzNumber: 2, name: "Juz 2", startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252, surahNumbers: [2] },
  { juzNumber: 3, name: "Juz 3", startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92, surahNumbers: [2, 3] },
  { juzNumber: 4, name: "Juz 4", startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23, surahNumbers: [3, 4] },
  { juzNumber: 5, name: "Juz 5", startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147, surahNumbers: [4] },
  { juzNumber: 6, name: "Juz 6", startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81, surahNumbers: [4, 5] },
  { juzNumber: 7, name: "Juz 7", startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110, surahNumbers: [5, 6] },
  { juzNumber: 8, name: "Juz 8", startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87, surahNumbers: [6, 7] },
  { juzNumber: 9, name: "Juz 9", startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40, surahNumbers: [7, 8] },
  { juzNumber: 10, name: "Juz 10", startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92, surahNumbers: [8, 9] },
  { juzNumber: 11, name: "Juz 11", startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5, surahNumbers: [9, 10, 11] },
  { juzNumber: 12, name: "Juz 12", startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52, surahNumbers: [11, 12] },
  { juzNumber: 13, name: "Juz 13", startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52, surahNumbers: [12, 13, 14] },
  { juzNumber: 14, name: "Juz 14", startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128, surahNumbers: [15, 16] },
  { juzNumber: 15, name: "Juz 15", startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74, surahNumbers: [17, 18] },
  { juzNumber: 16, name: "Juz 16", startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135, surahNumbers: [18, 19, 20] },
  { juzNumber: 17, name: "Juz 17", startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78, surahNumbers: [21, 22] },
  { juzNumber: 18, name: "Juz 18", startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20, surahNumbers: [23, 24, 25] },
  { juzNumber: 19, name: "Juz 19", startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55, surahNumbers: [25, 26, 27] },
  { juzNumber: 20, name: "Juz 20", startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45, surahNumbers: [27, 28, 29] },
  { juzNumber: 21, name: "Juz 21", startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30, surahNumbers: [29, 30, 31, 32, 33] },
  { juzNumber: 22, name: "Juz 22", startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27, surahNumbers: [33, 34, 35, 36] },
  { juzNumber: 23, name: "Juz 23", startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31, surahNumbers: [36, 37, 38, 39] },
  { juzNumber: 24, name: "Juz 24", startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46, surahNumbers: [39, 40, 41] },
  { juzNumber: 25, name: "Juz 25", startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37, surahNumbers: [41, 42, 43, 44, 45] },
  { juzNumber: 26, name: "Juz 26", startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30, surahNumbers: [46, 47, 48, 49, 50, 51] },
  { juzNumber: 27, name: "Juz 27", startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29, surahNumbers: [51, 52, 53, 54, 55, 56, 57] },
  { juzNumber: 28, name: "Juz 28", startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12, surahNumbers: [58, 59, 60, 61, 62, 63, 64, 65, 66] },
  { juzNumber: 29, name: "Juz 29", startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50, surahNumbers: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77] },
  { juzNumber: 30, name: "Juz 30", startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6, surahNumbers: Array.from({ length: 37 }, (_, i) => 78 + i) },
];
