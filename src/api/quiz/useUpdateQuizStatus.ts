import api from "@/api/axios";
import toast from "react-hot-toast";

export const updateQuizStatus = async (game_id: string, isPublish: boolean) => {
  try {
    const formData = new FormData();
    formData.append("is_publish", String(isPublish));

    const res = await api.patch(
      `/api/game/game-type/quiz/${game_id}`,
      formData,
    );
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Failed to update quiz status:", err);
    toast.error(err.response?.data?.message || "Failed to update quiz status.");
    throw err;
  }
};
