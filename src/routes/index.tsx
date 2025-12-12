// src/routes/index.tsx (Contoh, sesuaikan dengan sistem routing Anda)

import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
// ... import komponen halaman lain
import MatchUpPlay from '@/pages/match-up/MatchUpPlay'; // Ganti dengan path yang benar
import MatchUpCreate from '@/pages/match-up/MatchUpCreate'; // Ganti dengan path yang benar

export const router = createBrowserRouter([
  // ... rute yang sudah ada (home page, quiz, dll)
  {
    path: '/',
    element: <HomePage />, // Home Page [cite: 49]
  },
  // Rute untuk memainkan game Match Up
  {
    path: '/play/match-up/:gameId',
    element: <MatchUpPlay />,
  },
  // Rute untuk membuat game Match Up
  {
    path: '/create/match-up',
    element: <MatchUpCreate />,
  },
]);