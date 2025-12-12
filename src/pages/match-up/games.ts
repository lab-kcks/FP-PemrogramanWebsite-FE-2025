import type { IMatchUpGame } from './types/index';

const createEmojiSvg = (emoji: string, bgColor: string) => {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="100%" height="100%" fill="${encodeURIComponent(bgColor)}" rx="12" ry="12" /><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36">${emoji}</text></svg>`;
};

const GAMES: IMatchUpGame[] = [
  {
    id: 'food-1',
    title: 'Meals & Snacks',
    pairs: [
      { word: createEmojiSvg('🍗', '#fff0e6'), definition: 'Ayam Goreng' },
      { word: createEmojiSvg('🍔', '#fffbe6'), definition: 'Burger' },
      { word: createEmojiSvg('🍕', '#fff0f0'), definition: 'Pizza' },
      { word: createEmojiSvg('🍢', '#f9f0ff'), definition: 'Sate' },
      { word: createEmojiSvg('🍜', '#fff5f5'), definition: 'Mie / Ramen' },
      { word: createEmojiSvg('🍟', '#fffce0'), definition: 'Kentang Goreng' },
      { word: createEmojiSvg('🍦', '#f0f7ff'), definition: 'Es Krim' },
      { word: createEmojiSvg('🍩', '#fff0f7'), definition: 'Donat' },
      { word: createEmojiSvg('🍣', '#ffebf0'), definition: 'Sushi' },
      { word: createEmojiSvg('🍳', '#fefce8'), definition: 'Telur' },
    ],
    isTimeBased: false,
  },
  {
    id: 'pairs-1',
    title: 'Daily Things',
    pairs: [
      { word: createEmojiSvg('🥄', '#f0f9ff'), definition: 'Sendok' },
      { word: createEmojiSvg('🍴', '#fff0f7'), definition: 'Garpu' },
      { word: createEmojiSvg('✂️', '#f1f5f9'), definition: 'Gunting' },
      { word: createEmojiSvg('🔑', '#fffbe6'), definition: 'Kunci' },
      { word: createEmojiSvg('☂️', '#eff6ff'), definition: 'Payung' },
      { word: createEmojiSvg('⏰', '#fff0e6'), definition: 'Jam' },
      { word: createEmojiSvg('📕', '#fef2f2'), definition: 'Buku' },
      { word: createEmojiSvg('✏️', '#fffbeb'), definition: 'Pensil' },
      { word: createEmojiSvg('👓', '#f8fafc'), definition: 'Kacamata' },
      { word: createEmojiSvg('👟', '#f3f4f6'), definition: 'Sepatu' },
    ],
    isTimeBased: false,
  },
  {
    id: 'images-1',
    title: 'Fruits',
    pairs: [
      { word: createEmojiSvg('🍎', '#fff7cc'), definition: 'Apel' },
      { word: createEmojiSvg('🍌', '#e0f7ff'), definition: 'Pisang' },
      { word: createEmojiSvg('🍇', '#fff0f0'), definition: 'Anggur' },
      { word: createEmojiSvg('🍍', '#f0fff0'), definition: 'Nanas' },
      { word: createEmojiSvg('🍓', '#fffbe6'), definition: 'Stroberi' },
      { word: createEmojiSvg('🍊', '#fff0e6'), definition: 'Jeruk' },
      { word: createEmojiSvg('🍑', '#f7f0ff'), definition: 'Persik' },
      { word: createEmojiSvg('🍐', '#f0f7ff'), definition: 'Pir' },
      { word: createEmojiSvg('🥭', '#fff7f0'), definition: 'Mangga' },
      { word: createEmojiSvg('🍉', '#fff7f7'), definition: 'Semangka' },
    ],
    isTimeBased: false,
  },
];

export default GAMES;
