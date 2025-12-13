export interface GameshowOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface GameshowQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  timeLimit: number;
  points: number;
  options: GameshowOption[];
}

export interface GameshowGameData {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  questions: GameshowQuestion[];
}

export interface CreateGameshowPayload {
  name: string;
  description?: string;
  score_per_question: number;
  countdown: number;
  is_question_randomized: boolean;
  is_answer_randomized: boolean;
  questions: {
    id: string;
    text: string;
    timeLimit: number;
    points: number;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface CheckAnswerPayload {
  questionId: string;
  optionId: string;
  timeTaken?: number;
}
