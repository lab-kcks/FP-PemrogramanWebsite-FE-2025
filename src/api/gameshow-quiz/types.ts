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
  name?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  questions: GameshowQuestion[];
  creator_id?: string;
  creator_name?: string;
  is_published?: boolean;
}

export interface GameListItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  creator_id?: string;
  creator_name?: string;
  is_published?: boolean;
  total_played?: number;
  total_liked?: number;
}

export interface CreateGameshowPayload {
  title: string;
  description?: string;
  thumbnail?: string;
  gameData: {
    questions: {
      id: string;
      text: string;
      imageUrl?: string;
      timeLimit: number;
      points: number;
      options: {
        id: string;
        text: string;
        isCorrect: boolean;
      }[];
    }[];
    randomizeQuestions: boolean;
  };
}

export interface CheckAnswerPayload {
  questionId: string;
  optionId: string;
  timeTaken?: number;
}
