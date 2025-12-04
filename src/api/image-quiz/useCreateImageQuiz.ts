import api from "@/api/axios";
import toast from "react-hot-toast";

interface Answer {
  answer_id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  question_id: string;
  questionText?: string;
  questionImages?: File | null;
  answers: Answer[];
  correct_answer_id: string;
}

interface Settings {
  isPublishImmediately: boolean;
  isQuestionRandomized: boolean;
  isAnswerRandomized: boolean;
}

export interface ImageQuizPayload {
  title: string;
  description?: string;
  thumbnail: File;
  questions: Question[];
  settings: Settings;
}

export const createImageQuiz = async (payload: ImageQuizPayload) => {
  try {
    const formData = new FormData();

    formData.append("thumbnail_image", payload.thumbnail);
    formData.append("name", payload.title);
    if (payload.description)
      formData.append("description", payload.description);

    formData.append(
      "is_publish_immediately",
      String(payload.settings.isPublishImmediately),
    );
    formData.append(
      "is_question_randomized",
      String(payload.settings.isQuestionRandomized),
    );
    formData.append(
      "is_answer_randomized",
      String(payload.settings.isAnswerRandomized),
    );

    const allFiles: File[] = [];
    payload.questions.forEach((q) => {
      if (q.questionImages) allFiles.push(q.questionImages);
    });

    allFiles.forEach((file) => formData.append("files_to_upload", file));

    const questionsPayload = payload.questions.map((q) => ({
      question_id: q.question_id,
      question_text: q.questionText,
      correct_answer_id: q.correct_answer_id,
      answers: q.answers.map((a) => ({
        answer_id: a.answer_id,
        answer_text: a.text,
      })),
      question_image_array_index: q.questionImages
        ? allFiles.indexOf(q.questionImages)
        : undefined,
    }));

    formData.append("questions", JSON.stringify(questionsPayload));

    const res = await api.post("/api/game/game-type/image-quiz", formData, {
      // Changed endpoint
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (err: unknown) {
    console.error("Failed to create image quiz:", err);
    toast.error("Failed to create image quiz. Please try again.");
    throw err;
  }
};
