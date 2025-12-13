import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Save, Loader2, Eye, CheckCircle } from "lucide-react";
import QuestionEditor from "./QuestionEditor";
import { useGameshowQuiz } from "../hooks/useGameshowQuiz";
import type { GameshowQuestion } from "@/api/gameshow-quiz/types";
import toast from "react-hot-toast";

interface GameInitialData {
  name?: string;
  title?: string;
  description?: string;
  questions?: GameshowQuestion[];
}

interface CreateGameshowFormProps {
  onSuccess: (gameId?: string) => void;
  initialData?: GameInitialData;
  gameId?: string;
}

const CreateGameshowForm = ({
  onSuccess,
  initialData,
  gameId,
}: CreateGameshowFormProps) => {
  const { createGame, updateGame, loading } = useGameshowQuiz();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<GameshowQuestion[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || initialData.title || "");
      setDescription(initialData.description || "");
      setQuestions(initialData.questions || []);
    }
  }, [initialData]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: uuid(),
        text: "",
        timeLimit: 30,
        points: 10,
        options: [],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const openPreview = () => {
    if (questions.length === 0) {
      toast.error("Tambahkan minimal 1 soal untuk preview!");
      return;
    }
    setPreviewIndex(0);
    setPreviewOpen(true);
  };

  const optionColors = [
    "bg-red-500 hover:bg-red-600",
    "bg-blue-500 hover:bg-blue-600",
    "bg-yellow-500 hover:bg-yellow-600",
    "bg-green-500 hover:bg-green-600",
  ];

  const optionLabels = ["A", "B", "C", "D"];

  const submit = async () => {
    if (!name.trim()) {
      toast.error("Nama game harus diisi!");
      return;
    }
    if (questions.length === 0) {
      toast.error("Harus ada minimal 1 soal!");
      return;
    }

    // Validate each question has text and at least 2 options with 1 correct
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.error(`Soal ${i + 1}: Pertanyaan harus diisi!`);
        return;
      }
      if (q.options.length < 2) {
        toast.error(`Soal ${i + 1}: Minimal 2 pilihan jawaban!`);
        return;
      }
      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        toast.error(`Soal ${i + 1}: Harus ada 1 jawaban benar!`);
        return;
      }
    }

    try {
      const payload = {
        title: name,
        description,
        thumbnail: "",
        gameData: {
          questions: questions.map((q) => ({
            id: q.id,
            text: q.text,
            imageUrl: q.imageUrl,
            timeLimit: q.timeLimit || 30,
            points: q.points || 1000,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.isCorrect || false,
            })),
          })),
          randomizeQuestions: false,
        },
      };

      if (gameId) {
        await updateGame(gameId, payload);
        toast.success("Game berhasil diperbarui!");
        onSuccess(gameId);
      } else {
        const result = await createGame(payload);
        toast.success("Game berhasil dibuat!");
        onSuccess(result?.id);
      }
    } catch (err) {
      console.error("Error menyimpan game:", err);
      toast.error("Gagal menyimpan game. Silakan coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Info Card */}
      <Card className="p-6">
        <Typography className="font-semibold mb-4">Informasi Game</Typography>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Nama Game *
            </label>
            <Input
              placeholder="Masukkan nama game"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Deskripsi
            </label>
            <Textarea
              placeholder="Masukkan deskripsi game (opsional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Questions Section */}
      <div className="flex items-center justify-between">
        <Typography className="font-semibold">
          Daftar Soal ({questions.length})
        </Typography>
        <Button variant="outline" size="sm" onClick={addQuestion}>
          <Plus className="w-4 h-4 mr-1" />
          Tambah Soal
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card className="p-8 text-center">
          <Typography className="text-slate-500 mb-4">
            Belum ada soal. Tambahkan minimal 1 soal untuk melanjutkan.
          </Typography>
          <Button onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Soal Pertama
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionEditor
              key={q.id}
              index={i}
              question={q}
              onChange={(updated) =>
                setQuestions((prev) =>
                  prev.map((x, idx) => (idx === i ? updated : x)),
                )
              }
              onRemove={() => removeQuestion(i)}
            />
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={openPreview}
          disabled={loading || questions.length === 0}
          className="min-w-[120px]"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button
          onClick={submit}
          disabled={loading || questions.length === 0}
          className="bg-blue-600 hover:bg-blue-700 min-w-[150px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {gameId ? "Perbarui Game" : "Simpan Game"}
            </>
          )}
        </Button>
      </div>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <DialogTitle className="text-white">
              Preview: {name || "Untitled Game"}
            </DialogTitle>
          </DialogHeader>

          {questions.length > 0 && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Progress */}
              <div className="px-4 py-2 bg-slate-100">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>
                    Soal {previewIndex + 1} dari {questions.length}
                  </span>
                  <span className="font-medium">10 poin</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${((previewIndex + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="flex-1 p-6 overflow-auto">
                <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
                  <Typography className="text-xl font-semibold text-center text-slate-800">
                    {questions[previewIndex]?.text || "(Belum ada pertanyaan)"}
                  </Typography>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                  {questions[previewIndex]?.options.map((option, idx) => (
                    <div
                      key={option.id || idx}
                      className={`${optionColors[idx % 4]} p-4 rounded-xl text-white relative transition-all cursor-default`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                          {optionLabels[idx]}
                        </span>
                        <span className="text-lg font-medium pt-0.5">
                          {option.text || "(Kosong)"}
                        </span>
                      </div>
                      {option.isCorrect && (
                        <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-white/80" />
                      )}
                    </div>
                  ))}
                </div>

                {questions[previewIndex]?.options.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    (Belum ada pilihan jawaban)
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="p-4 border-t bg-white flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                  disabled={previewIndex === 0}
                >
                  Sebelumnya
                </Button>
                <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === previewIndex
                          ? "bg-blue-600"
                          : "bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPreviewIndex((i) =>
                      Math.min(questions.length - 1, i + 1),
                    )
                  }
                  disabled={previewIndex === questions.length - 1}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateGameshowForm;
