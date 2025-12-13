// src/hooks/useGameshowQuiz.ts
import { useState } from 'react';
import { GameshowQuizAPI } from '@/api/gameshow-quiz/gameshow-quiz.api';

export const useGameshowQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playGame = async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await GameshowQuizAPI.play(gameId);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load game');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (
    gameId: string,
    payload: {
      question_index: number;
      selected_answer_index: number;
    },
  ) => {
    try {
      setLoading(true);
      setError(null);
      const res = await GameshowQuizAPI.submitAnswer(gameId, payload);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to submit answer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getResult = async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await GameshowQuizAPI.getResult(gameId);
      return res.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to get result');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    playGame,
    submitAnswer,
    getResult,
  };
};
