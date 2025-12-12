import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Typography } from "@/components/ui/typography";
import {
  ArrowLeft,
  Pause,
  Play,
  Trophy,
  Timer,
  Star,
  LogOut,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import api from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useImageQuizPlayData } from "@/api/image-quiz/useImageQuizPlayData";
import { checkImageQuizAnswer } from "@/api/image-quiz/useCheckImageQuizAnswer";
import { useImageQuizSound } from "@/hooks/useImageQuizSound";

interface Answer {
  answer_id: string;
  answer_text: string;
}

interface Question {
  question_id: string;
  question_text: string;
  question_image_url: string | null;
  correct_answer_id: string;
  answers: Answer[];
}

interface ImageQuizPlayConfig {
  time_limit_seconds: number;
  total_tiles: number;
  reveal_interval: number;
}

interface ImageQuizGameData {
  id: string;
  name: string;
  description: string;
  thumbnail_image: string | null;
  questions: Question[];
  tile_config: ImageQuizPlayConfig;
}

// Grid Configuration
const GRID_COLS = 16;
const GRID_ROWS = 8;
const TOTAL_BLOCKS = GRID_COLS * GRID_ROWS;

function PlayImageQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSound, stopSound, toggleMute, isMuted } = useImageQuizSound();

  // Data State
  const {
    data: fetchedQuizData,
    loading: fetchingQuiz,
    error: fetchError,
  } = useImageQuizPlayData(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<ImageQuizGameData | null>(null);

  // Game State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeModal, setActiveModal] = useState<"menu" | "answer" | null>(
    null,
  );
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [hiddenBlocks, setHiddenBlocks] = useState<number[]>([]);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timeLimit, setTimeLimit] = useState<number>(30);

  // Countdown State (3-2-1-Go)
  const [startCountdown, setStartCountdown] = useState<number | null>(null);

  // Score State
  const [currentScore, setCurrentScore] = useState(0);
  const [scoreParticles, setScoreParticles] = useState<
    { blockIndex: number; delay: number }[]
  >([]);

  // User Progress
  const [userAnswers, setUserAnswers] = useState<
    { question_id: string; selected_answer_id: string; time_spent_ms: number }[]
  >([]);

  // Results
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{
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
  } | null>(null);

  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const timeTrackingRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef<number>(0);

  // --- Family 100 Styles ---
  const family100Styles = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700;800&family=Orbitron:wght@400;700;900&display=swap');

      .font-f100 { font-family: 'Chakra Petch', sans-serif; }
      .font-digital { font-family: 'Orbitron', monospace; }

      .f100-bg {
        background: radial-gradient(circle at center, #172554 0%, #020617 100%); /* Blue-950 to Slate-950 */
        color: white;
      }

      .f100-panel {
        background: linear-gradient(180deg, #1e3a8a 0%, #172554 100%);
        border: 4px solid #3b82f6; /* Blue-500 */
        box-shadow: 
          0 0 0 2px #1e3a8a, /* Inner dark border */
          0 0 20px rgba(59, 130, 246, 0.6), /* Outer Glow */
          inset 0 0 30px rgba(0,0,0,0.5); /* Inner Depth */
        border-radius: 1rem;
      }

      .f100-panel-glass {
        background: rgba(30, 58, 138, 0.85);
        backdrop-filter: blur(12px);
        border: 2px solid rgba(96, 165, 250, 0.5);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .f100-title-text {
        font-family: 'Chakra Petch', sans-serif;
        font-weight: 800;
        text-transform: uppercase;
        background: linear-gradient(180deg, #ffffff 0%, #93c5fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: drop-shadow(2px 2px 0px #1e3a8a);
      }

      .f100-btn-primary {
        background: linear-gradient(180deg, #fbbf24 0%, #d97706 100%);
        border: 3px solid #fef3c7;
        color: #451a03;
        font-family: 'Chakra Petch', sans-serif;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 
          0 6px 0 #92400e, 
          0 10px 15px rgba(0,0,0,0.4);
        transition: all 0.1s;
      }
      .f100-btn-primary:hover {
        background: linear-gradient(180deg, #fcd34d 0%, #b45309 100%);
        transform: translateY(-2px);
        box-shadow: 
          0 8px 0 #92400e, 
          0 12px 20px rgba(0,0,0,0.5);
      }
      .f100-btn-primary:active {
        transform: translateY(4px);
        box-shadow: 0 2px 0 #92400e;
      }

      .f100-btn-secondary {
        background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
        border: 3px solid #bfdbfe;
        color: white;
        font-family: 'Chakra Petch', sans-serif;
        font-weight: 700;
        box-shadow: 0 5px 0 #1e3a8a, 0 8px 15px rgba(0,0,0,0.3);
      }
      .f100-btn-secondary:hover {
        background: linear-gradient(180deg, #60a5fa 0%, #1e40af 100%);
      }

      .f100-buzzer {
        background: radial-gradient(circle at 30% 30%, #ef4444 0%, #991b1b 100%);
        border: 4px solid #fca5a5;
        box-shadow: 
          0 10px 0 #7f1d1d,
          0 0 50px rgba(220, 38, 38, 0.6),
          inset 0 0 20px rgba(0,0,0,0.4);
      }
      .f100-buzzer:active {
        transform: scale(0.95);
        box-shadow: 
          0 2px 0 #7f1d1d,
          0 0 20px rgba(220, 38, 38, 0.8);
      }
    `}</style>
  );

  // 1. Fetch Data & Init
  useEffect(() => {
    if (fetchingQuiz) {
      setLoading(true);
      return;
    }
    setLoading(false);

    if (fetchError) {
      setError(fetchError);
      toast.error(fetchError);
      return;
    }

    if (fetchedQuizData) {
      console.log("Game Data Loaded:", fetchedQuizData);
      setQuiz(fetchedQuizData);
      const limit = fetchedQuizData.tile_config?.time_limit_seconds || 30;
      setTimeLimit(limit);
      setTimeLeft(limit);

      // Initialize grid
      const allBlocks = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
      setHiddenBlocks(allBlocks);
    }

    return () => {
      cleanupTimers();
      stopSound("bgm");
    };
  }, [fetchedQuizData, fetchingQuiz, fetchError]);

  // Effect for 3-2-1 Countdown
  useEffect(() => {
    if (startCountdown === null) return;

    if (startCountdown > 0) {
      playSound("tick"); // Using tick for countdown
      const timer = setTimeout(() => {
        setStartCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (startCountdown === 0) {
      setStartCountdown(null);
      startActualGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCountdown]);

  // Game Timer Countdown Logic
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && !isPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const next = Math.max(0, prev - 1);
          if (next <= 10 && next > 0) playSound("tick");
          return next;
        });
      }, 1000);
    } else {
      stopSound("bgm"); // Pause BGM if game paused/stopped
    }
    return () => clearInterval(timer);
  }, [isPlaying, isPaused, timeLeft]);

  // Check Time Up
  useEffect(() => {
    if (timeLeft <= 0 && isPlaying && !isPaused) {
      handleTimeUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isPlaying, isPaused]);

  const cleanupTimers = () => {
    if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    // if (timeTrackingRef.current) clearInterval(timeTrackingRef.current);
  };

  const resetGrid = () => {
    console.log("Resetting Grid for next round");
    const allBlocks = Array.from({ length: TOTAL_BLOCKS }, (_, i) => i);
    setHiddenBlocks(allBlocks);
    setScoreParticles([]);
    setIsPlaying(false);
    setIsPaused(false);
    setActiveModal(null);
    setIsTimeUp(false);
    cleanupTimers();
    setTimeLeft(timeLimit);
    stopSound("bgm");
  };

  const initiateRoundStart = () => {
    console.log("Initiating Round Start");
    if (!quiz || finished) return;
    setStartCountdown(3);
    playSound("countdown");
  };

  const startActualGame = () => {
    console.log("Starting Actual Game");
    setIsPlaying(true);
    setIsPaused(false);
    setActiveModal(null);
    setIsTimeUp(false);
    setTimeLeft(timeLimit);
    roundStartTimeRef.current = Date.now();
    playSound("bgm");

    if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    revealTimerRef.current = setInterval(
      () => {
        setHiddenBlocks((prev) => {
          if (prev.length === 0) {
            clearInterval(revealTimerRef.current!);
            return prev;
          }
          const randomIndex = Math.floor(Math.random() * prev.length);
          const newBlocks = [...prev];
          newBlocks.splice(randomIndex, 1);
          playSound("reveal");
          return newBlocks;
        });
      },
      (quiz?.tile_config?.reveal_interval || 0.2) * 1000,
    );
  };

  const handleTimeUp = () => {
    console.log("Time Up!");
    setIsTimeUp(true);
    cleanupTimers();
    setIsPlaying(false);
    setIsPaused(true);
    setActiveModal("answer");
    playSound("timeUp");
    stopSound("bgm");
  };

  // -- Pause Menu Logic --
  const handleOpenPauseMenu = () => {
    cleanupTimers();
    setIsPlaying(false);
    setIsPaused(true);
    setActiveModal("menu");
    stopSound("bgm");
  };

  // -- Answer Logic --
  const handleOpenAnswerModal = () => {
    cleanupTimers();
    setIsPlaying(false);
    setIsPaused(true);
    setActiveModal("answer");
    playSound("buzz");
    stopSound("bgm");
  };

  const handleResumeGame = () => {
    if (isTimeUp) return;

    console.log("Resuming Game");
    setIsPaused(false);
    setActiveModal(null);
    if (!finished && quiz && timeLeft > 0) {
      setIsPlaying(true);
      playSound("bgm");
      if (revealTimerRef.current) clearInterval(revealTimerRef.current);
      revealTimerRef.current = setInterval(
        () => {
          setHiddenBlocks((prev) => {
            if (prev.length === 0) {
              clearInterval(revealTimerRef.current!);
              return prev;
            }
            const randomIndex = Math.floor(Math.random() * prev.length);
            const newBlocks = [...prev];
            newBlocks.splice(randomIndex, 1);
            playSound("reveal");
            return newBlocks;
          });
        },
        (quiz?.tile_config?.reveal_interval || 0.2) * 1000,
      );
    }
  };

  const calculatePointsFromTimeSpent = (timeSpentSeconds: number) => {
    if (timeSpentSeconds <= 5) return 5;
    if (timeSpentSeconds <= 10) return 4;
    if (timeSpentSeconds <= 20) return 3;
    return 1;
  };

  // ScoreParticle Component (nested for simplicity)
  const ScoreParticle = ({
    delay,
    blockIndex,
  }: {
    delay: number;
    blockIndex: number;
  }) => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
      const appearTimer = setTimeout(() => {
        setOpacity(1); // Fade in
        const fadeOutTimer = setTimeout(() => {
          setOpacity(0); // Fade out
        }, 800); // Stay visible for 800ms
        return () => clearTimeout(fadeOutTimer);
      }, delay); // Start delay
      return () => clearTimeout(appearTimer);
    }, [delay, blockIndex]); // blockIndex to re-trigger for same delay on different block

    return (
      <div
        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-300"
        style={{ opacity: opacity }}
      >
        <span className="text-yellow-400 font-black text-3xl drop-shadow-[3px_3px_0px_#000] font-digital">
          +1
        </span>
      </div>
    );
  };

  const handleAnswerSelect = async (selectedAnswerId: string) => {
    if (!quiz) return;

    console.log("Answer Selected:", selectedAnswerId);
    cleanupTimers();
    setIsPlaying(false);
    setIsPaused(false);
    setActiveModal(null);
    setIsTimeUp(false);
    setHiddenBlocks([]);
    stopSound("bgm");

    const currentQ = quiz.questions[currentQuestionIndex];

    // Calculate precise time spent based on start time
    const currentTime = Date.now();
    const timeSpentMs = currentTime - roundStartTimeRef.current;
    const timeSpentSeconds = timeSpentMs / 1000;

    const isCorrect = selectedAnswerId === currentQ.correct_answer_id;
    const estimatedPoints = isCorrect
      ? calculatePointsFromTimeSpent(timeSpentSeconds)
      : 0;

    if (isCorrect) {
      playSound("correct");
    } else {
      playSound("wrong");
    }

    setCurrentScore((prev) => prev + estimatedPoints);

    // -- Animation Logic --
    if (isCorrect && estimatedPoints > 0) {
      // Select random indices from hiddenBlocks
      const availableIndices = [...hiddenBlocks];
      const particles: { blockIndex: number; delay: number }[] = [];

      // Shuffle and pick
      for (let i = 0; i < estimatedPoints; i++) {
        if (availableIndices.length === 0) break;
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const blockIndex = availableIndices[randomIndex];
        particles.push({
          blockIndex,
          delay: i * 200, // 200ms stagger
        });
        availableIndices.splice(randomIndex, 1);
      }
      setScoreParticles(particles);

      // Clear particles after animation
      setTimeout(
        () => {
          setScoreParticles([]);
        },
        (estimatedPoints > 0 ? estimatedPoints - 1 : 0) * 200 + 1400,
      );
    }

    const updatedAnswers = [
      ...userAnswers,
      {
        question_id: currentQ.question_id,
        selected_answer_id: selectedAnswerId,
        time_spent_ms: timeSpentMs,
      },
    ];
    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      toast.success("Correct Answer!", {
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#166534",
          color: "#fff",
        },
      });
    } else {
      toast.error("Wrong Answer!", {
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#991b1b",
          color: "#fff",
        },
      });
    }

    setTimeout(
      async () => {
        const isLast = currentQuestionIndex === quiz.questions.length - 1;
        if (!isLast) {
          console.log("Moving to next question");
          setCurrentQuestionIndex((prev) => prev + 1);
          resetGrid();
          initiateRoundStart();
        } else {
          console.log("Submitting Quiz");
          await submitQuiz(updatedAnswers);
        }
      },
      isCorrect ? 2500 : 1500,
    );
  };
  const handleExitGame = async () => {
    stopSound("bgm");
    navigate("/");
  };

  const fetchAndUpdateUser = async () => {
    try {
      const response = await api.get("/api/auth/me");
      useAuthStore.getState().setUser(response.data.data);
    } catch (error) {
      console.error("Failed to fetch and update user data:", error);
      toast.error("Failed to refresh user data.");
    }
  };

  const submitQuiz = async (finalAnswers: typeof userAnswers) => {
    try {
      setLoading(true);
      setFinished(true);
      cleanupTimers();
      stopSound("bgm");

      const res = await checkImageQuizAnswer({
        game_id: id!,
        answers: finalAnswers,
      });

      setResult(res);
      setCurrentScore(res.total_score);

      // Fetch updated user data and update the store
      await fetchAndUpdateUser();
    } catch (err) {
      console.error(err);
      setError("Failed to submit results.");
      toast.error("Failed to submit results.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const normalizedPath = path.replace(/\\/g, "/");
    return `${import.meta.env.VITE_API_URL}/${normalizedPath}`;
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading || fetchingQuiz || !quiz) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#020617] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center gap-4 bg-[#020617] text-white">
        <Typography variant="h4" className="text-red-500 font-f100">
          {error}
        </Typography>
        <Button
          onClick={() => navigate("/my-projects")}
          className="f100-btn-secondary"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (finished && result) {
    const { correct_count, total_questions, total_score } = result;
    const percentage =
      total_questions > 0 ? (correct_count / total_questions) * 100 : 0;

    return (
      <div className="w-full min-h-screen flex justify-center items-center f100-bg p-4 relative overflow-hidden">
        {family100Styles}
        {/* Background Beams/Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent animate-pulse pointer-events-none"></div>

        <div className="f100-panel p-6 md:p-8 text-center max-w-lg w-full space-y-6 relative z-10">
          <div className="relative inline-block">
            <Trophy
              className="mx-auto text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
              size={80}
            />
            <div className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full"></div>
          </div>

          <div className="space-y-2">
            <h2 className="font-f100 font-black text-3xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 drop-shadow-md">
              {percentage >= 80
                ? "Survey Says... Top Score!"
                : percentage >= 50
                  ? "Good Answer!"
                  : "Nice Try!"}
            </h2>
            <p className="text-blue-200 font-medium text-sm">
              You completed the game!
            </p>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border-2 border-blue-500/30 backdrop-blur-sm space-y-3">
            <div className="flex justify-between items-center border-b border-blue-500/30 pb-2">
              <span className="text-blue-200 font-f100 uppercase tracking-widest text-xs">
                Accuracy
              </span>
              <span className="font-digital text-xl font-bold text-white">
                {percentage.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-blue-500/30 pb-2">
              <span className="text-blue-200 font-f100 uppercase tracking-widest text-xs">
                Correct
              </span>
              <span className="font-digital text-xl font-bold text-green-400">
                {correct_count} <span className="text-xs text-gray-500">/</span>{" "}
                {total_questions}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-yellow-400 font-f100 uppercase tracking-widest font-bold text-sm">
                Final Score
              </span>
              <span className="font-digital text-3xl font-black text-yellow-400 drop-shadow-lg">
                {total_score}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-3">
            <Button
              className="w-full f100-btn-primary h-12 text-lg"
              onClick={() => {
                setFinished(false);
                setResult(null);
                setCurrentScore(0);
                setCurrentQuestionIndex(0);
                setUserAnswers([]);
                resetGrid();
              }}
            >
              Play Again
            </Button>
            <Button
              className="w-full f100-btn-secondary h-10 text-base"
              onClick={handleExitGame}
            >
              Exit Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  if (!currentQ)
    return <div className="text-white">Error: Question not found</div>;

  return (
    <div className="w-full min-h-screen f100-bg flex flex-col font-f100 overflow-hidden">
      {family100Styles}

      {/* Top Bar / Scoreboard */}
      <div className="h-16 w-full flex justify-between items-center px-4 md:px-8 bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] border-b-4 border-blue-600 shadow-xl relative z-20">
        {/* Left: Info */}
        <div className="flex items-center gap-4 w-1/3">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-full"
            onClick={handleExitGame}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="hidden md:block">
            <h1 className="f100-title-text text-lg md:text-xl leading-none">
              {quiz.name}
            </h1>
            <span className="text-blue-300 text-xs font-bold tracking-widest uppercase">
              Round {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
          </div>
        </div>

        {/* Center: Pause/Play Control (floating) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Visual Element only - Logo Place holder or Game Show styling */}
          <div className="hidden md:flex flex-col items-center">
            <div className="w-24 h-1 bg-blue-500/50 rounded-full mb-1"></div>
            <div className="w-16 h-1 bg-blue-500/30 rounded-full"></div>
          </div>
        </div>

        {/* Right: Timer & Score */}
        <div className="w-1/3 flex justify-end items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-300 hover:text-white hover:bg-blue-800/50 rounded-full mr-2"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>

          {/* Timer */}
          <div
            className={`f100-panel bg-black px-3 py-1 flex items-center gap-2 min-w-[100px] justify-center ${timeLeft <= 10 && isPlaying ? "border-red-500 animate-pulse" : ""}`}
          >
            <Timer
              className={`w-4 h-4 ${timeLeft <= 10 ? "text-red-500" : "text-blue-300"}`}
            />
            <span
              className={`font-digital text-xl font-bold ${timeLeft <= 10 ? "text-red-500" : "text-white"}`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Score */}
          <div className="f100-panel bg-black px-4 py-1 flex items-center gap-2 min-w-[90px] justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors"></div>
            <Star className="text-yellow-400 w-4 h-4 fill-yellow-400 drop-shadow-md" />
            <span className="font-digital text-xl font-bold text-yellow-400 drop-shadow-sm">
              {currentScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 relative">
        {/* Pause/Play Button (Mobile/Desktop friendly position) */}
        <div className="absolute top-4 right-4 md:hidden z-30">
          {/* Mobile Pause - handled in top bar usually, but let's stick to layout */}
        </div>

        {/* Question Text */}
        <div className="w-full max-w-4xl mb-2 md:mb-4 text-center relative z-10">
          <div className="inline-block bg-[#1e40af]/80 backdrop-blur-sm border-2 border-blue-400 px-8 py-2 rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
            <Typography
              variant="h3"
              className="text-lg md:text-xl font-f100 font-bold text-white drop-shadow-md"
            >
              {currentQ.question_text || "Reveal the image and guess!"}
            </Typography>
          </div>
        </div>

        {/* The "Big Board" (Image Grid) */}
        <div className="relative w-full max-w-4xl aspect-[2/1] bg-black rounded-xl overflow-hidden shadow-[0_0_40px_rgba(30,58,138,0.6)] border-8 border-slate-800 ring-4 ring-blue-600/50">
          {/* Pause Overlay (When paused manually) */}
          {isPaused && !isTimeUp && !activeModal && (
            <div className="absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex items-center justify-center">
              <h2 className="text-4xl font-black text-white uppercase tracking-widest">
                Paused
              </h2>
            </div>
          )}

          {/* Background Image */}
          {currentQ.question_image_url ? (
            <img
              src={getImageUrl(currentQ.question_image_url) || ""}
              alt="Hidden"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900">
              <span className="font-f100">NO IMAGE SIGNAL</span>
            </div>
          )}

          {/* The Grid Blocks */}
          <div
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
          >
            {Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
              const particle = scoreParticles.find((p) => p.blockIndex === i);
              return (
                <div key={i} className="relative">
                  {/* The Cover Block */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-950 ${isPlaying ? "transition-transform duration-500 ease-in-out" : ""} ${
                      hiddenBlocks.includes(i)
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-0"
                    }`}
                  >
                    {/* Optional: Add numbers to blocks like Family Feud? Maybe too messy for 16x8. 
                         Let's just keep them as blue panels with a slight 3D feel */}
                    <div className="absolute inset-[1px] border border-blue-500/30 opacity-50"></div>
                  </div>

                  {particle && (
                    <ScoreParticle delay={particle.delay} blockIndex={i} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Start Round Overlay */}
          {!isPlaying &&
            hiddenBlocks.length === TOTAL_BLOCKS &&
            !isPaused &&
            startCountdown === null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20 backdrop-blur-sm">
                <Button
                  onClick={initiateRoundStart}
                  className="f100-btn-primary text-2xl py-8 px-12 rounded-full h-auto animate-bounce shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                >
                  START ROUND
                </Button>
              </div>
            )}

          {/* 3-2-1 Countdown Overlay */}
          {startCountdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-30 backdrop-blur-sm">
              <div className="text-[12rem] font-digital font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
                {startCountdown === 0 ? "GO!" : startCountdown}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls / Buzzer */}
        <div className="mt-4 md:mt-6 flex gap-8 z-10 items-center justify-center w-full">
          {/* Pause Button (Desktop) */}
          <div className="hidden md:block">
            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full border-2 border-blue-400 bg-blue-900/50 text-blue-200 hover:bg-blue-800 hover:text-white"
              onClick={
                isPlaying && !isPaused ? handleOpenPauseMenu : handleResumeGame
              }
              disabled={!isPlaying && !isPaused}
            >
              {isPaused ? (
                <Play className="w-6 h-6 ml-1" />
              ) : (
                <Pause className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* BIG RED BUZZER */}
          <div className="relative group">
            {isPlaying && (
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse group-hover:bg-red-500/50 transition-all"></div>
            )}
            <button
              disabled={!isPlaying || isPaused}
              className={`
                  relative w-24 h-24 md:w-28 md:h-28 rounded-full f100-buzzer transition-all duration-150 ease-out
                  flex items-center justify-center
                  ${!isPlaying || isPaused ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer hover:scale-105 active:scale-95"}
                `}
              onClick={handleOpenAnswerModal}
            >
              <span className="font-f100 font-black text-white text-xl md:text-2xl tracking-widest drop-shadow-md z-10 pointer-events-none">
                BUZZ
              </span>
              {/* Shine effect */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-10 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-[1px] pointer-events-none" />
            </button>
          </div>

          {/* Spacer for symmetry on desktop */}
          <div className="hidden md:block w-14"></div>
        </div>
      </div>

      {/* Unified Dialog Handler */}
      <Dialog
        open={isPaused && activeModal !== null}
        onOpenChange={(open) => {
          if (!open && activeModal !== "answer" && !isTimeUp) {
            handleResumeGame();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-2xl bg-[#0f172a] border-4 border-blue-500 rounded-2xl shadow-[0_0_50px_rgba(30,58,138,0.8)] p-0 overflow-hidden"
          onInteractOutside={(e) => {
            if (activeModal === "answer" || isTimeUp) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (activeModal === "answer" || isTimeUp) e.preventDefault();
          }}
        >
          {/* Header Bar */}
          <div className="bg-blue-800 p-4 border-b-2 border-blue-500 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-pulse"></div>
            <DialogTitle className="text-3xl font-f100 font-bold text-white uppercase tracking-widest drop-shadow-md relative z-10">
              {activeModal === "menu"
                ? "Game Paused"
                : isTimeUp
                  ? "Time's Up!"
                  : "Who is it?"}
            </DialogTitle>
          </div>

          <div className="p-8 relative">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(#3b82f6 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* MENU PAUSE */}
            {activeModal === "menu" && (
              <div className="flex flex-col gap-4 relative z-10">
                <p className="text-center text-blue-200 text-lg mb-4 font-f100">
                  The clock is stopped. Ready to continue?
                </p>
                <Button
                  className="f100-btn-primary text-xl py-6"
                  onClick={handleResumeGame}
                >
                  <Play className="mr-2 w-6 h-6" /> Resume Game
                </Button>
                <div className="h-px bg-blue-800/50 my-2"></div>
                <Button
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 font-f100"
                  onClick={() => {
                    setFinished(false);
                    setResult(null);
                    setCurrentScore(0);
                    setCurrentQuestionIndex(0);
                    setUserAnswers([]);
                    resetGrid();
                  }}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" /> Restart Round
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white font-f100"
                  onClick={handleExitGame}
                >
                  <LogOut className="mr-2 w-4 h-4" /> Exit to Menu
                </Button>
              </div>
            )}

            {/* ANSWER MODAL */}
            {activeModal === "answer" && (
              <div className="relative z-10">
                <p className="text-center text-blue-200 mb-6 font-f100 text-lg">
                  {isTimeUp
                    ? "You're out of time! Select an answer to see if you can still get points."
                    : "Select the correct answer from the board below!"}
                </p>

                <div className="grid grid-cols-1 gap-4">
                  {currentQ.answers.map((ans, idx) => (
                    <button
                      key={idx}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-950 border-2 border-blue-500 hover:border-yellow-400 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:-translate-y-1 text-left flex items-center"
                      onClick={() => handleAnswerSelect(ans.answer_id)}
                    >
                      {/* Option Letter Box */}
                      <div className="bg-blue-800 border border-blue-400 text-white font-digital font-bold w-12 h-12 flex items-center justify-center rounded-lg text-xl mr-4 group-hover:bg-yellow-500 group-hover:text-black transition-colors shadow-inner">
                        {String.fromCharCode(65 + idx)}
                      </div>

                      {/* Text */}
                      <span className="text-white font-f100 font-bold text-xl group-hover:text-yellow-400 transition-colors">
                        {ans.answer_text}
                      </span>

                      {/* Hover Shine */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PlayImageQuiz;
