import api from "@/api/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Answer {
  answer_id: string;
  answer_text: string;
}

interface Question {
  question_id: string;
  question_text: string;
  question_image_url: string | null;
  answers: Answer[];
}

interface ImageQuizPlayConfig {
  time_limit_seconds: number;
  total_tiles: number;
  reveal_interval: number;
}

export interface ImageQuizPlayData {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  questions: Question[];
  tile_config: ImageQuizPlayConfig;
}

export const useImageQuizPlayData = (game_id: string | undefined) => {
  const [data, setData] = useState<ImageQuizPlayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!game_id) {
      setLoading(false);
      return;
    }

    const fetchPlayData = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/game/game-type/image-quiz/${game_id}/play/public`,
        );
        setData(response.data.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load game data.");
        toast.error(err.response?.data?.message || "Failed to load game data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayData();
  }, [game_id]);

  return { data, loading, error };
};
