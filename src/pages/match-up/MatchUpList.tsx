import React from 'react';
import { useNavigate } from 'react-router-dom';
import GAMES from './games';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, ArrowLeft } from 'lucide-react';

const MatchUpList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen game-gradient-bg p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl animate__animated animate__fadeIn">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-gradient drop-shadow-sm">
            Match Up Arena
          </h1>
          <p className="text-purple-200 text-lg">
            Pilih tantanganmu dan uji pengetahuanmu!
          </p>
        </header>

        <div className="mb-6 flex justify-center">
          <Button
            onClick={() => navigate('/home')}
            variant="outline"
            className="border-white/20 hover:bg-white/10 text-white hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke WordIT
          </Button>
        </div>

        <div className="grid gap-4 md:gap-6">
          {GAMES.map((g, idx) => (
            <Card
              key={g.id}
              className="relative p-6 flex flex-col md:flex-row justify-between items-center group cursor-pointer bg-white/95 backdrop-blur-sm border-transparent hover:border-cyan-400 border-2 shadow-xl hover:shadow-cyan-500/20 transition-all duration-300"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => navigate(`/play/match-up/${g.id}`)}
            >
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <div className="text-2xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                  {g.title}
                </div>
                <div className="text-slate-500 mt-2 flex items-center justify-center md:justify-start gap-2 font-medium">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs border border-purple-200">
                    {g.pairs.length} Pasangan
                  </span>
                  {g.isTimeBased && (
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs border border-pink-200">
                      Time Attack
                    </span>
                  )}
                </div>
              </div>

              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 shadow-lg shadow-purple-500/30 transition-all transform group-hover:scale-105 group-hover:bg-cyan-600 group-hover:shadow-cyan-500/30"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/play/match-up/${g.id}`);
                }}
              >
                <Play className="mr-2 h-5 w-5" /> Main Sekarang
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchUpList;
