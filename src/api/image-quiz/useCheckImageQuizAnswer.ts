import api from "@/api/axios";
import toast from "react-hot-toast";

export interface AnswerSubmission {
  question_id: string;
  selected_answer_id: string;
  time_spent_ms: number;
}

export interface CheckImageQuizAnswerPayload {
  game_id: string;
  answers: AnswerSubmission[];
}

export interface ImageQuizCheckResult {
  total_questions: number;
  total_answered: number;
  correct_count: number;
  total_score: number;
  details: {
    question_id: string;
    is_correct: boolean;
    score: number;
    correct_answer_id: string;
  }[];
}

export const checkImageQuizAnswer = async (
  payload: CheckImageQuizAnswerPayload,
) => {
  try {
    const res = await api.post(
      `/api/game/game-type/image-quiz/${payload.game_id}/check`,
      {
        answers: payload.answers,
      },
    );
    return res.data.data as ImageQuizCheckResult;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Failed to submit image quiz answers:", err);
    toast.error(err.response?.data?.message || "Failed to submit answers.");
    throw err;
  }
};
