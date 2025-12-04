import api from "@/api/axios";
import toast from "react-hot-toast";

export const deleteQuiz = async (game_id: string) => {
  try {
    const res = await api.delete(`/api/game/game-type/quiz/${game_id}`);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Failed to delete quiz:", err);
    toast.error(err.response?.data?.message || "Failed to delete quiz.");
    throw err;
  }
};
