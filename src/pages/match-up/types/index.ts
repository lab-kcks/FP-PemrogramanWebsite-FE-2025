/**
 * Interface untuk data game Match Up yang akan diterima/dibuat
 */
interface IMatchUpGame {
  id: string;
  title: string;
  pairs: {
    word: string; // Kata/Istilah
    definition: string; // Definisi/Pasangan
  }[];
  isTimeBased: boolean;
  // Tambahkan field lain seperti creatorId, description, dll.
}

/**
 * Interface untuk state saat bermain game
 */
interface IGameProgress {
  score: number;
  matchedPairs: string[]; // List ID pasangan yang sudah dicocokkan
  startTime: number;
}

export type { IMatchUpGame, IGameProgress };