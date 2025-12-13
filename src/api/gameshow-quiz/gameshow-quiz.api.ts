import api from "@/api/axios";
import type { CreateGameshowPayload, CheckAnswerPayload } from "./types";

const BASE_PATH = "/api/game/game-type/gameshow-quiz";

export const GameshowQuizAPI = {
  // CREATE
  create(payload: CreateGameshowPayload) {
    return api.post(BASE_PATH, payload);
  },

  // LIST
  list() {
    return api.get(BASE_PATH);
  },

  // DETAIL
  getDetail(id: string) {
    return api.get(`${BASE_PATH}/${id}`);
  },

  // PLAY (PUBLIC)
  play(id: string) {
    return api.get(`${BASE_PATH}/play/${id}`);
  },

  // PREVIEW (CREATOR)
  preview(id: string) {
    return api.get(`${BASE_PATH}/preview/${id}`);
  },

  // CHECK ANSWER
  checkAnswer(gameId: string, payload: CheckAnswerPayload) {
    return api.post(`${BASE_PATH}/${gameId}/evaluate`, payload);
  },

  // UPDATE
  update(id: string, payload: CreateGameshowPayload) {
    return api.put(`${BASE_PATH}/${id}`, payload);
  },

  // DELETE
  delete(id: string) {
    return api.delete(`${BASE_PATH}/${id}`);
  },
};
