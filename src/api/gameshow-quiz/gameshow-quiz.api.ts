// src/api/gameshow-quiz/gameshow-quiz.api.ts
import api from '@/api/axios';

export const GameshowQuizAPI = {
  play: (gameId: string) =>
    api.get(`/api/game/game-list/gameshow-quiz/${gameId}/play`),

  submitAnswer: (
    gameId: string,
    payload: {
      question_index: number;
      selected_answer_index: number;
    },
  ) =>
    api.post(
      `/api/game/game-list/gameshow-quiz/${gameId}/answer`,
      payload,
    ),

  getResult: (gameId: string) =>
    api.get(`/api/game/game-list/gameshow-quiz/${gameId}/result`),
};
