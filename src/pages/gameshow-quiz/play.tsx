import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useGameshowQuiz } from "./hooks/useGameshowQuiz";
import GamePlayer from "./components/GamePlayer";
import type { GameshowGameData } from "@/api/gameshow-quiz/types";

const PlayGameshowPage = () => {
  const { id } = useParams<{ id: string }>();
  const { playGame, loading, error } = useGameshowQuiz();
  const [game, setGame] = useState<GameshowGameData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    if (!id) return;
    try {
      const data = await playGame(id);
      console.log("Game data received:", data);
      setGame(data);
    } catch (err: unknown) {
      console.error("Failed to load game:", err);
      const error = err as { message?: string };
      setLoadError(error.message || "Failed to load game");
    }
  }, [id, playGame]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  if (loadError || error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error: {loadError || error}</p>
        <p className="text-sm text-gray-500 mt-2">Game ID: {id}</p>
      </div>
    );
  }

  if (loading || !game) {
    return <p className="p-6">Loading game...</p>;
  }

  return <GamePlayer game={game} />;
};

export default PlayGameshowPage;
