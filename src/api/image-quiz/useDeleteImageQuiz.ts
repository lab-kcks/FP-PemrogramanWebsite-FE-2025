import api from "@/api/axios";
import toast from "react-hot-toast";

export const deleteImageQuiz = async (game_id: string) => {
  try {
    const res = await api.delete(`/api/game/game-type/image-quiz/${game_id}`);
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Failed to delete image quiz:", err);
    toast.error(err.response?.data?.message || "Failed to delete image quiz.");
    throw err;
  }
};
