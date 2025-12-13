import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGameshowQuiz } from "./hooks/useGameshowQuiz";
import GameCard from "./components/GameCard";

interface GameListItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
}

const GameshowQuizListPage = () => {
  const { listGames, loading, error } = useGameshowQuiz();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameListItem[]>([]);

  const fetchGames = useCallback(async () => {
    try {
      const data = await listGames();
      setGames(data);
    } catch (err) {
      console.error("Failed to load games:", err);
    }
  }, [listGames]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gameshow Quiz</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate("/gameshow-quiz/create")}
        >
          + Buat Game
        </button>
      </div>

      {games.length === 0 ? (
        <p className="text-gray-500">Belum ada game. Buat game pertamamu!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={() => navigate(`/gameshow-quiz/play/${game.id}`)}
              onEdit={() => navigate(`/gameshow-quiz/edit/${game.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GameshowQuizListPage;
