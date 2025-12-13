import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/ui/layout/Navbar";
import {
  ArrowLeft,
  Plus,
  Play,
  Edit,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { useGameshowQuiz } from "./hooks/useGameshowQuiz";
import { useAuthStore } from "@/store/useAuthStore";
import type { GameListItem } from "@/api/gameshow-quiz/types";
import toast from "react-hot-toast";

const GameshowQuizListPage = () => {
  const { listGames, deleteGame } = useGameshowQuiz();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [games, setGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<GameListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await listGames();
        setGames(data);
      } catch (err) {
        console.error("Gagal memuat game:", err);
        setError("Gagal memuat daftar game. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [listGames]);

  const handleDeleteClick = (game: GameListItem) => {
    setGameToDelete(game);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;

    try {
      setDeleting(true);
      await deleteGame(gameToDelete.id);
      setGames((prev) => prev.filter((g) => g.id !== gameToDelete.id));
      toast.success("Game berhasil dihapus!");
    } catch (err: unknown) {
      console.error("Gagal menghapus game:", err);
      const error = err as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Gagal menghapus game. Silakan coba lagi.";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    }
  };

  const isOwner = (game: GameListItem) => {
    return user?.id === game.creator_id;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b px-6 py-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent text-orange-500 hover:text-orange-600 mb-2 font-bold text-lg h-auto p-0"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          <Typography
            variant="h2"
            className="mb-1 font-bold text-slate-900 text-2xl border-none pb-0"
          >
            Gameshow Quiz
          </Typography>
          <Typography variant="muted" className="text-slate-500 text-sm">
            Pilih atau buat game kuis interaktif
          </Typography>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Action Bar */}
          <div className="flex justify-end mb-6">
            <Button
              onClick={() => navigate("/gameshow-quiz/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Game Baru
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Memuat game...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <Typography className="text-red-500 mb-4">{error}</Typography>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && games.length === 0 && (
            <div className="text-center py-20">
              <Typography className="text-slate-500 mb-4">
                Belum ada game. Buat game pertamamu!
              </Typography>
              <Button
                onClick={() => navigate("/gameshow-quiz/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buat Game Baru
              </Button>
            </div>
          )}

          {/* Game Grid */}
          {!loading && !error && games.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Card
                  key={game.id}
                  className="p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white rounded-xl"
                >
                  <div className="mb-4">
                    <Typography className="font-bold text-lg text-slate-900 mb-2">
                      {game.name || game.title || "Untitled Game"}
                    </Typography>
                    <Typography className="text-sm text-slate-500 line-clamp-2 mb-3">
                      {game.description || "Tidak ada deskripsi"}
                    </Typography>
                    {/* Author Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      <span>
                        {game.creator_name || "Anonim"}
                        {isOwner(game) && (
                          <span className="ml-1 text-blue-500">(Anda)</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => navigate(`/gameshow-quiz/play/${game.id}`)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Main
                    </Button>
                    {isOwner(game) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/gameshow-quiz/edit/${game.id}`)
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(game)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Game?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus &quot;
              {gameToDelete?.name || gameToDelete?.title}&quot;? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameshowQuizListPage;
