import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb, Trophy, ArrowRight } from "lucide-react";

// --- TIPE DATA (Sesuai Briefing) ---
interface QuestionData {
  question_id: string;
  image_url: string;
  shuffled_letters: string[]; // Huruf yang diacak BE
  hint_limit: number;
  correct_word?: string; // OPTIONAL: Dibutuhkan FE untuk fitur Hint "Smart Fill"
}

interface GameData {
  questions: QuestionData[];
  score_per_question: number;
  name?: string;
}

interface AnswerPayload {
  question_id: string;
  guessed_word: string;
  is_hinted: boolean[];
}

const PlayAnagram = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData | null>(null);

  // Game Flow State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<{
    totalScore: number;
    feedback: string;
  } | null>(null);

  // Gameplay State (Per Soal)
  const [userSlots, setUserSlots] = useState<(string | null)[]>([]); // Kotak jawaban
  const [bankStatus, setBankStatus] = useState<boolean[]>([]); // Status huruf di bawah (terpakai/belum)
  const [hintStatus, setHintStatus] = useState<boolean[]>([]); // Status hint per kotak
  const [hintsUsedCount, setHintsUsedCount] = useState(0);

  // Accumulator Jawaban (Dikirim ke BE saat finish)
  const [allAnswers, setAllAnswers] = useState<AnswerPayload[]>([]);

  // --- 1. FETCH GAME DATA ---
  useEffect(() => {
    const fetchGame = async () => {
      try {
        // Pastikan port backend benar (3001)
        const res = await fetch(
          `http://localhost:3001/api/v1/game/anagram/${id}/play/public`,
        );

        if (!res.ok) throw new Error("Gagal load game");

        const data = await res.json();

        // Validasi data minimal
        if (!data.questions || data.questions.length === 0) {
          throw new Error("Data soal kosong");
        }

        setGameData(data);
        // Init soal pertama
        initQuestion(data.questions[0]);
      } catch (err) {
        console.error(err);
        alert("Gagal memuat game. Pastikan ID benar atau Backend nyala.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchGame();
  }, [id]);

  // --- HELPER: Init State untuk Soal Baru ---
  const initQuestion = (question: QuestionData) => {
    const length = question.shuffled_letters.length;
    setUserSlots(Array(length).fill(null)); // Kotak kosong
    setBankStatus(Array(length).fill(false)); // Semua huruf bank available
    setHintStatus(Array(length).fill(false)); // Belum ada hint
    setHintsUsedCount(0);
  };

  // --- GAMEPLAY LOGIC ---

  // 1. Klik Huruf di Bank (Bawah) -> Pindah ke Slot (Atas)
  const handleBankClick = (letter: string, originalIndex: number) => {
    // Cari slot kosong pertama
    const firstEmptyIndex = userSlots.findIndex((s) => s === null);
    if (firstEmptyIndex === -1) return; // Penuh

    // Update Slot
    const newSlots = [...userSlots];
    newSlots[firstEmptyIndex] = letter;

    // Tandai huruf bank sebagai terpakai
    const newBankStatus = [...bankStatus];
    newBankStatus[originalIndex] = true;

    // UPDATE STATE
    setUserSlots(newSlots);
    setBankStatus(newBankStatus);
  };

  // 2. Klik Slot (Atas) -> Balikin ke Bank
  const handleSlotClick = (slotIndex: number) => {
    const letter = userSlots[slotIndex];
    if (!letter || hintStatus[slotIndex]) return; // Kalau hint gaboleh dihapus

    // Hapus dari slot
    const newSlots = [...userSlots];
    newSlots[slotIndex] = null;
    setUserSlots(newSlots);

    // Balikin ke bank (Cari huruf yg cocok di bank yg statusnya true, set jadi false satu aja)
    const bankIndexToRestore = gameData!.questions[
      currentQIndex
    ].shuffled_letters.findIndex(
      (l, i) => l === letter && bankStatus[i] === true,
    );

    if (bankIndexToRestore !== -1) {
      const newBankStatus = [...bankStatus];
      newBankStatus[bankIndexToRestore] = false;
      setBankStatus(newBankStatus);
    }
  };

  // 3. Fitur Hint
  const useHint = () => {
    const currentQ = gameData?.questions[currentQIndex];
    if (!currentQ) return;

    // Cek limit
    if (hintsUsedCount >= currentQ.hint_limit) return alert("Hint habis!");

    // Cek ketersediaan Correct Word (KARENA BE MUNGKIN GA NGIRIM)
    if (!currentQ.correct_word)
      return alert(
        "Backend tidak mengirim kunci jawaban, Hint tidak bisa dipakai.",
      );

    // Cari slot kosong
    const emptyIndices = userSlots
      .map((val, idx) => (val === null ? idx : -1))
      .filter((idx) => idx !== -1);

    // Kalau penuh tapi salah, alert user
    if (emptyIndices.length === 0)
      return alert("Kotak penuh! Hapus beberapa huruf dulu untuk pakai hint.");

    // Pilih random slot kosong
    const randomIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const correctLetter = currentQ.correct_word[randomIndex]; // Huruf benar di posisi itu

    // Cari huruf tersebut di Bank yang belum terpakai
    const bankIndex = currentQ.shuffled_letters.findIndex(
      (l, i) => l === correctLetter && !bankStatus[i],
    );

    if (bankIndex === -1) {
      return alert(
        "Huruf hint sudah terpakai di kotak yang salah. Reset atau hapus huruf yang salah!",
      );
    }

    // Eksekusi Hint
    const newSlots = [...userSlots];
    newSlots[randomIndex] = correctLetter;

    const newBankStatus = [...bankStatus];
    newBankStatus[bankIndex] = true;

    const newHintStatus = [...hintStatus];
    newHintStatus[randomIndex] = true; // Tandai ini hasil hint

    setUserSlots(newSlots);
    setBankStatus(newBankStatus);
    setHintStatus(newHintStatus);
    setHintsUsedCount((prev) => prev + 1);
  };

  // 4. Submit Jawaban & Lanjut
  const handleNext = () => {
    // Cek apakah slot penuh
    if (userSlots.some((s) => s === null)) {
      return alert("Isi semua kotak dulu!");
    }

    const currentQ = gameData!.questions[currentQIndex];

    // Simpan jawaban ke temporary state
    const answer: AnswerPayload = {
      question_id: currentQ.question_id,
      guessed_word: userSlots.join(""), // Gabung array jadi string "RICE"
      is_hinted: hintStatus,
    };

    const updatedAnswers = [...allAnswers, answer];
    setAllAnswers(updatedAnswers);

    // Cek apakah ini soal terakhir
    if (currentQIndex < gameData!.questions.length - 1) {
      // Lanjut Soal Berikutnya
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      initQuestion(gameData!.questions[nextIndex]);
    } else {
      // Finish Game
      submitAllAnswers(updatedAnswers);
    }
  };

  // 5. Kirim ke Backend (Final Check)
  const submitAllAnswers = async (answers: AnswerPayload[]) => {
    setIsFinished(true); // Ganti UI ke Loading Result
    try {
      const payload = { answers };

      const res = await fetch(
        `http://localhost:3001/api/v1/game/anagram/${id}/check`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await res.json();

      // Update state skor akhir
      setFinalScore({
        totalScore: result.total_score || 0,
        feedback: result.message || "Game Selesai",
      });
    } catch (err) {
      console.error(err);
      alert("Gagal submit skor.");
    }
  };

  // --- RENDER ---

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
      </div>
    );

  // --- SCREEN: RESULT ---
  if (isFinished && finalScore) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 space-y-6">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Game Finished!
            </h1>
            <p className="text-slate-500 mt-2">
              Kamu berhasil menyelesaikan permainan.
            </p>
          </div>
          <div className="bg-slate-100 p-6 rounded-xl">
            <p className="text-sm uppercase font-bold text-slate-400">
              Total Score
            </p>
            <p className="text-5xl font-black text-blue-600">
              {finalScore.totalScore}
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="w-full" onClick={() => navigate("/my-projects")}>
              Back to Home
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Play Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- SCREEN: GAMEPLAY ---
  const currentQ = gameData?.questions[currentQIndex];
  if (!currentQ) return null;

  const isLastQuestion =
    currentQIndex === (gameData?.questions.length || 0) - 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Header Info */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <div className="text-slate-500 font-medium">
          Question {currentQIndex + 1}{" "}
          <span className="text-slate-300">/ {gameData?.questions.length}</span>
        </div>
        <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold">
          Score Value: {gameData?.score_per_question} pts
        </div>
      </div>

      <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
        <CardContent className="p-8 space-y-8 flex flex-col items-center">
          {/* 1. GAMBAR HINT */}
          <div className="w-full h-64 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
            <img
              src={
                currentQ.image_url ||
                "https://placehold.co/600x400?text=No+Image"
              }
              alt="Hint"
              className="w-full h-full object-contain"
            />
          </div>

          {/* 2. KOTAK JAWABAN (SLOTS) */}
          <div className="flex gap-2 flex-wrap justify-center">
            {userSlots.map((char, idx) => (
              <div
                key={idx}
                onClick={() => handleSlotClick(idx)}
                className={`
                  w-12 h-14 md:w-16 md:h-20 rounded-lg flex items-center justify-center text-2xl font-bold border-b-4 cursor-pointer transition-all select-none
                  ${
                    char
                      ? hintStatus[idx]
                        ? "bg-yellow-100 border-yellow-400 text-yellow-700" // Gaya kalau hasil Hint
                        : "bg-blue-500 border-blue-700 text-white shadow-lg translate-y-[-2px]" // Gaya kalau isi User
                      : "bg-slate-200 border-slate-300 text-transparent" // Gaya kosong
                  }
                `}
              >
                {char || "_"}
              </div>
            ))}
          </div>

          {/* 3. BANK HURUF (SHUFFLED) */}
          <div className="flex gap-2 flex-wrap justify-center mt-4 p-4 bg-slate-50 rounded-xl w-full">
            {currentQ.shuffled_letters.map((char, idx) => (
              <Button
                key={idx}
                onClick={() => handleBankClick(char, idx)}
                disabled={bankStatus[idx]} // Disable kalau udah dipake
                variant="outline"
                className={`
                   w-12 h-12 text-lg font-bold transition-all
                   ${bankStatus[idx] ? "opacity-0" : "opacity-100 hover:scale-110"}
                `}
              >
                {char}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FOOTER ACTIONS */}
      <div className="w-full max-w-2xl mt-8 flex justify-between items-center">
        {/* Tombol Hint */}
        <Button
          variant="ghost"
          onClick={useHint}
          disabled={
            !currentQ.correct_word || hintsUsedCount >= currentQ.hint_limit
          }
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
        >
          <Lightbulb
            className={`w-5 h-5 mr-2 ${hintsUsedCount >= currentQ.hint_limit ? "text-slate-300" : "fill-yellow-500"}`}
          />
          Hint ({currentQ.hint_limit - hintsUsedCount} Left)
        </Button>

        {/* Tombol Next / Finish */}
        <Button
          size="lg"
          onClick={handleNext}
          className="bg-green-600 hover:bg-green-700 px-8"
        >
          {isLastQuestion ? "Finish Game" : "Next Question"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default PlayAnagram;
