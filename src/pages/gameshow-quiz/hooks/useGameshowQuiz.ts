import { useState } from "react";
import { GameshowQuizAPI } from "@/api/gameshow-quiz/gameshow-quiz.api";
import type {
  CreateGameshowPayload,
  CheckAnswerPayload,
} from "@/api/gameshow-quiz/types";

export const useGameshowQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exec = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(error.response?.data?.error || error.message || "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const listGames = async () => {
    const res = await exec(() => GameshowQuizAPI.list());
    return res.data?.data ?? res.data ?? [];
  };

  const getDetail = async (id: string) => {
    const res = await exec(() => GameshowQuizAPI.getDetail(id));
    return res.data?.data ?? res.data;
  };

  const playGame = async (id: string) => {
    const res = await exec(() => GameshowQuizAPI.play(id));
    return res.data?.data ?? res.data;
  };

  const createGame = async (payload: CreateGameshowPayload) => {
    const res = await exec(() => GameshowQuizAPI.create(payload));
    return res.data?.data ?? res.data;
  };

  const updateGame = async (id: string, payload: CreateGameshowPayload) => {
    const res = await exec(() => GameshowQuizAPI.update(id, payload));
    return res.data?.data ?? res.data;
  };

  const previewGame = async (id: string) => {
    const res = await exec(() => GameshowQuizAPI.preview(id));
    return res.data?.data ?? res.data;
  };

  const checkAnswer = async (gameId: string, payload: CheckAnswerPayload) => {
    const res = await exec(() => GameshowQuizAPI.checkAnswer(gameId, payload));
    return res.data?.data ?? res.data;
  };

  return {
    loading,
    error,
    createGame,
    updateGame,
    listGames,
    getAllGames: listGames,
    getDetail,
    getGameDetail: getDetail,
    playGame,
    playGamePublic: playGame,
    previewGame,
    checkAnswer,
  };
};
