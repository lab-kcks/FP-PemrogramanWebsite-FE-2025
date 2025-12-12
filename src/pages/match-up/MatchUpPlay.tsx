// src/pages/match-up/MatchUpPlay.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IMatchUpGame } from './types/index';
import GAMES from './games';
import toast from 'react-hot-toast';
import { Trophy, Clock, ArrowLeft, CheckCircle, Home, RotateCcw, PartyPopper } from 'lucide-react';

const MatchUpPlay: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<IMatchUpGame | null>(null);
  const [loading, setLoading] = useState(true);

  // lists used for rendering
  const [wordsList, setWordsList] = useState<{ idx: number; text: string }[]>([]);
  const [defsList, setDefsList] = useState<{ idx: number; text: string }[]>([]);

  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number>(0);
  const [hoverDef, setHoverDef] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [matchedAnim, setMatchedAnim] = useState<Record<number, boolean>>({});
  const [isGameFinished, setIsGameFinished] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load game
  useEffect(() => {
    if (!gameId) {
      toast.error('Game ID tidak ditemukan');
      navigate('/');
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem('matchUpGames') || '[]');
      const foundGame = stored.find((g: IMatchUpGame) => g.id === gameId);
      const staticGame = GAMES.find(g => g.id === gameId);
      const useGame = foundGame || staticGame || null;

      if (useGame) {
        if (!Array.isArray(useGame.pairs)) {
          toast.error('Data game tidak valid');
          navigate('/');
          return;
        }
        setGame(useGame);

        const words = useGame.pairs.map((p: { word: string; definition: string }, idx: number) => ({ idx, text: p.word }));
        const defs = useGame.pairs.map((p: { word: string; definition: string }, idx: number) => ({ idx, text: p.definition }));

        const shuffleArray = (arr: any[]) => {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        };

        shuffleArray(words);
        shuffleArray(defs);

        setWordsList(words);
        setDefsList(defs);
      } else {
        toast.error('Game tidak ditemukan');
        navigate('/');
      }
    } catch (error) {
      toast.error('Gagal memuat game');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }, [gameId, navigate]);

  // Timer
  useEffect(() => {
    if (isGameFinished) return;

    setSecondsLeft(60);
    const t = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          toast('Waktu habis!', { icon: '⏰' });
          setIsGameFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameId, isGameFinished]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => { });
        audioCtxRef.current = null;
      }
    };
  }, []);

  const ensureAudio = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not available', e);
      }
    }
  };

  const playTone = (freq: number, duration = 0.12, type: OscillatorType = 'sine') => {
    try {
      ensureAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      o.stop(ctx.currentTime + duration + 0.02);
    } catch (e) {
      // ignore
    }
  };

  const playSuccessTone = () => playTone(880, 0.12, 'sine');
  const playFailTone = () => playTone(220, 0.14, 'sawtooth');

  const applyCorrectMatch = (wordIdx: number, defIdx: number) => {
    if (matches[wordIdx] !== undefined || matchedAnim[wordIdx]) return;

    setMatchedAnim(prev => ({ ...prev, [wordIdx]: true }));
    playSuccessTone();

    setTimeout(() => {
      const updated = { ...matches, [wordIdx]: defIdx };
      setMatches(updated);
      setMatchedAnim(prev => {
        const copy = { ...prev };
        delete copy[wordIdx];
        return copy;
      });
      // add 10 points per correct, cap at 100
      setScore(prev => Math.min(100, prev + 10));
      toast.success('Benar! (+10)', {
        icon: '✨',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      if (Object.keys(updated).length === (game?.pairs.length ?? 0)) {
        setIsGameFinished(true);
        // Play victory sound sequence?
        setTimeout(() => playTone(523.25, 0.1), 0);
        setTimeout(() => playTone(659.25, 0.1), 150);
        setTimeout(() => playTone(783.99, 0.2), 300);
        setTimeout(() => playTone(1046.50, 0.4), 500);
      }
    }, 520);
  };

  const handleWordSelect = (origIdx: number) => {
    if (isGameFinished) return;
    setSelectedWordIdx(selectedWordIdx === origIdx ? null : origIdx);
  };

  const handleDefinitionMatch = (defOrigIdx: number) => {
    if (isGameFinished || selectedWordIdx === null || game === null) return;

    if (selectedWordIdx === defOrigIdx) {
      applyCorrectMatch(selectedWordIdx, defOrigIdx);
      setSelectedWordIdx(null);
    } else {
      playFailTone();
      toast.error('Salah! Coba lagi.', {
        style: { background: '#ef4444', color: '#fff' }
      });
    }
  };

  const handleDropMatch = (wordOrigIdx: number, defOrigIdx: number) => {
    if (isGameFinished || game === null) return;
    if (wordOrigIdx === defOrigIdx) {
      applyCorrectMatch(wordOrigIdx, defOrigIdx);
    } else {
      playFailTone();
      toast.error('Salah! Coba lagi.', {
        style: { background: '#ef4444', color: '#fff' }
      });
    }
  };

  const handleRestart = () => {
    if (!game) return;

    setMatches({});
    setMatchedAnim({});
    setScore(0);
    setSecondsLeft(60);
    setIsGameFinished(false);

    // Reshuffle
    const words = game.pairs.map((p: any, idx: number) => ({ idx, text: p.word }));
    const defs = game.pairs.map((p: any, idx: number) => ({ idx, text: p.definition }));

    const shuffleArray = (arr: any[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };

    shuffleArray(words);
    shuffleArray(defs);

    setWordsList(words);
    setDefsList(defs);
  };

  if (loading) return <div className="min-h-screen game-gradient-bg flex items-center justify-center text-white">Loading...</div>;
  if (!game) return <div className="min-h-screen game-gradient-bg flex items-center justify-center text-white">Game tidak ditemukan</div>;

  const itemsMatched = Object.keys(matches).length;
  const totalItems = game.pairs.length;
  const progressPercent = Math.round((itemsMatched / totalItems) * 100);
  const isAllMatched = itemsMatched === totalItems;

  return (
    <div className="min-h-screen game-gradient-bg p-4 md:p-8 font-sans relative overflow-hidden">

      {/* Victory Overlay */}
      {isGameFinished && isAllMatched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate__animated animate__fadeIn">
          <div className="bg-white/95 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-4 border-purple-400 animate__animated animate__zoomIn">
            <div className="mb-4 flex justify-center">
              <div className="bg-yellow-100 p-4 rounded-full">
                <PartyPopper className="h-16 w-16 text-yellow-500 animate-bounce" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-600 mb-2">
              Luar Biasa!
            </h2>
            <p className="text-gray-600 mb-6 font-medium">
              Kamu berhasil menyelesaikan semua pasangan!
            </p>

            <div className="bg-purple-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-purple-100">
              <div className="text-center">
                <p className="text-xs text-purple-400 uppercase font-bold">Skor</p>
                <p className="text-2xl font-bold text-purple-700">{score}</p>
              </div>
              <div className="h-8 w-px bg-purple-200"></div>
              <div className="text-center">
                <p className="text-xs text-purple-400 uppercase font-bold">Sisa Waktu</p>
                <p className="text-2xl font-bold text-purple-700">{secondsLeft}s</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleRestart} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-cyan-500/30">
                <RotateCcw className="mr-2 h-5 w-5" /> Main Lagi
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-bold h-12 rounded-xl">
                <Home className="mr-2 h-5 w-5" /> Kembali ke Daftar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay (Time Out) */}
      {isGameFinished && !isAllMatched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate__animated animate__fadeIn">
          <div className="bg-white/95 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-4 border-red-400">
            <div className="mb-4 flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <Clock className="h-16 w-16 text-red-500" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Waktu Habis!</h2>
            <p className="text-gray-600 mb-6 font-medium">Jangan menyerah, coba lagi ya!</p>

            <div className="bg-red-50 p-4 rounded-xl mb-6 flex justify-center items-center border border-red-100">
              <div className="text-center">
                <p className="text-xs text-red-400 uppercase font-bold">Skor Akhir</p>
                <p className="text-3xl font-bold text-red-600">{score}</p>
              </div>
            </div>

            <Button onClick={handleRestart} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-red-500/30">
              <RotateCcw className="mr-2 h-5 w-5" /> Coba Lagi
            </Button>
            <Button onClick={() => navigate('/')} variant="ghost" className="mt-2 w-full text-gray-400 hover:text-white">
              Kembali
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header HUD */}
        <header className="glass-panel p-4 md:p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white rounded-full h-10 w-10 p-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                {game.title}
              </h1>
              <p className="text-sm text-purple-200">Match Up</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm shadow-inner">
              <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-300">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-purple-200 uppercase tracking-wider font-bold">Skor</div>
                <div className="text-xl font-bold text-white leading-none">{score}</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-sm transition-colors shadow-inner ${secondsLeft < 10 ? 'bg-red-500/20 border-red-500/30' : 'bg-blue-500/20 border-blue-500/30'
              }`}>
              <div className={`p-2 rounded-lg ${secondsLeft < 10 ? 'text-red-400' : 'text-cyan-300'}`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-purple-200 uppercase tracking-wider font-bold">Waktu</div>
                <div className="text-xl font-bold text-white leading-none">{secondsLeft}s</div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-8 bg-white/5 h-3 rounded-full overflow-hidden backdrop-blur-sm relative border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(167,139,250,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <main className="grid md:grid-cols-2 gap-8 md:gap-12 pb-12">
          {/* Kolom Kata/Istilah */}
          <section className="animate__animated animate__fadeInLeft">
            <h2 className="text-xl font-bold mb-4 text-cyan-300 flex items-center gap-2">
              <span className="bg-cyan-500/20 p-1.5 rounded-lg border border-cyan-500/30 text-xs">A</span>
              Kata / Istilah
            </h2>
            <div className="space-y-4">
              {wordsList.map((item) => {
                const origIdx = item.idx;
                const isSelected = selectedWordIdx === origIdx;
                if (matches[origIdx] !== undefined) return null;

                const animClass = matchedAnim[origIdx] ? 'match-pop' : '';

                return (
                  <Card
                    key={origIdx}
                    className={`
                      relative p-4 cursor-pointer text-center font-bold text-lg transition-all duration-200 transform select-none
                      border-2 overflow-hidden
                      ${animClass}
                      ${isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-cyan-400 text-white shadow-xl scale-105 z-10'
                        : 'bg-white/95 border-transparent text-slate-800 hover:bg-white hover:scale-[1.02] shadow-md hover:shadow-cyan-500/20'
                      }
                    `}
                    onClick={() => handleWordSelect(origIdx)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(origIdx));
                      e.dataTransfer.effectAllowed = 'move';
                      handleWordSelect(origIdx);
                    }}
                  >
                    {isSelected && (
                      <div className="absolute -right-2 -top-2 bg-cyan-400 text-black rounded-full p-0.5 shadow-lg animate-bounce">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}

                    {item.text && item.text.startsWith('data:image') ? (
                      <img src={item.text} alt={`img-${origIdx}`} className="mx-auto w-32 h-32 object-contain rounded-md" />
                    ) : (
                      item.text
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Kolom Definisi */}
          <section className="animate__animated animate__fadeInRight">
            <h2 className="text-xl font-bold mb-4 text-purple-300 flex items-center gap-2">
              <span className="bg-purple-500/20 p-1.5 rounded-lg border border-purple-500/30 text-xs">B</span>
              Definisi / Arti
            </h2>
            <div className="space-y-4">
              {defsList.map((item) => {
                const origIdx = item.idx;
                if (matches[origIdx] !== undefined) return null;

                const animClass = matchedAnim[origIdx] ? 'match-pop' : '';
                const isHovered = hoverDef === origIdx;

                return (
                  <Card
                    key={origIdx}
                    className={`
                      p-4 cursor-pointer text-center text-base font-medium transition-all duration-200 select-none
                      border-2
                      ${animClass}
                      ${isHovered
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 scale-105 shadow-xl'
                        : 'bg-white/95 border-transparent text-slate-800 hover:bg-white shadow-md hover:shadow-purple-500/20'
                      }
                    `}
                    onClick={() => handleDefinitionMatch(origIdx)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const data = e.dataTransfer.getData('text/plain');
                      const wordIdx = Number(data);
                      handleDropMatch(wordIdx, origIdx);
                      setHoverDef(null);
                    }}
                    onDragEnter={() => setHoverDef(origIdx)}
                    onDragLeave={() => setHoverDef(null)}
                  >
                    {item.text}
                  </Card>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default MatchUpPlay;
