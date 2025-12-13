import { useState, useCallback } from "react";
import Timer from "./Timer";
import { useGameshowQuiz } from "../hooks/useGameshowQuiz";
import { ResultModal } from "./ScoreResult";

interface GamePlayerProps {
  game: {
    id: string;
    questions: Array<{
      id: string;
      text: string;
      timeLimit: number;
      points: number;
      options: Array<{
        id: string;
        text: string;
      }>;
    }>;
  };
}

const GamePlayer = ({ game }: GamePlayerProps) => {
  const { checkAnswer } = useGameshowQuiz();
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    points: number;
    correctAnswerText?: string;
  } | null>(null);

  const questions = game?.questions ?? [];
  const question = questions[idx];

  const handleTimeUp = useCallback(() => {
    setLastResult({
      correct: false,
      points: 0,
      correctAnswerText: undefined,
    });
    setShowResult(true);
  }, []);

  const handleNext = () => {
    setShowResult(false);
    setLastResult(null);
    setIdx((i) => i + 1);
  };

  if (!game || !questions.length) {
    return <div className="p-6">No questions available</div>;
  }

  if (!question) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Game Selesai!</h2>
        <p className="text-xl">Skor Akhir: {score}</p>
      </div>
    );
  }

  const answer = async (optionId: string) => {
    try {
      const res = await checkAnswer(game.id, {
        questionId: question.id,
        optionId,
      });

      const isCorrect = res?.correct ?? false;
      const earnedPoints = isCorrect ? question.points : 0;

      if (isCorrect) {
        setScore((s) => s + earnedPoints);
      }

      setLastResult({
        correct: isCorrect,
        points: earnedPoints,
        correctAnswerText: res?.correctAnswerText,
      });
      setShowResult(true);
    } catch (err) {
      console.error("Error checking answer:", err);
      handleNext();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-semibold">
          Soal {idx + 1} / {questions.length}
        </span>
        <span className="text-lg">Skor: {score}</span>
      </div>

      <Timer seconds={question.timeLimit} onEnd={handleTimeUp} resetKey={idx} />

      <h2 className="text-xl font-bold my-4">{question.text}</h2>

      <div className="grid grid-cols-1 gap-3">
        {question.options?.map((o) => (
          <button
            key={o.id}
            onClick={() => answer(o.id)}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-left"
          >
            {o.text}
          </button>
        ))}
      </div>

      {showResult && lastResult && (
        <ResultModal
          isCorrect={lastResult.correct}
          score={lastResult.points}
          message={lastResult.correct ? "Benar!" : "Salah!"}
          correctAnswerText={lastResult.correctAnswerText}
          onNext={handleNext}
          isLastQuestion={idx >= questions.length - 1}
        />
      )}
    </div>
  );
};

export default GamePlayer;
