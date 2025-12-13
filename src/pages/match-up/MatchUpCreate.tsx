// src/pages/match-up/MatchUpCreate.tsx

import React, { useState } from "react";
import api from "@/api/axios";
import { toast } from "react-hot-toast";
import { Trash2, Plus, Check } from "lucide-react";

// --- Imports Komponen UI ---
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import Navbar from "@/components/ui/layout/Navbar";
import { Switch } from "@/components/ui/switch";
import ImageUploader from "@/components/ui/forms/ImageUploader"; // Asumsi Anda punya komponen ini
// --- End Imports Komponen UI ---

// Interface untuk Form State di Frontend
interface MatchUpPair {
  id: number; // Dipakai untuk key di React, tidak dikirim ke BE
  term: string;
  definition: string;
}

// Interface untuk Payload yang akan dikirim ke Backend
interface MatchUpPayload {
  title: string;
  description?: string;
  thumbnail: File | null;
  pairs: Omit<MatchUpPair, "id">[]; // Hanya kirim term & definition
  isPublishImmediately: boolean;
}

// Endpoint untuk Game Match Up (asumsi disepakati di Backend)
const MATCHUP_ENDPOINT = "/game/game-type/match-up";

export default function MatchUpCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [pairs, setPairs] = useState<MatchUpPair[]>(
    [{ id: Date.now(), term: "", definition: "" }], // Mulai dengan 1 pasangan
  );
  const [isPublishImmediately, setIsPublishImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPair = () => {
    setPairs([...pairs, { id: Date.now(), term: "", definition: "" }]);
  };

  const handleRemovePair = (id: number) => {
    setPairs(pairs.filter((pair) => pair.id !== id));
  };

  const handlePairChange = (
    id: number,
    field: keyof Omit<MatchUpPair, "id">,
    value: string,
  ) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === id ? { ...pair, [field]: value } : pair,
      ),
    );
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Judul Game harus diisi.");
      return false;
    }
    if (!thumbnail) {
      toast.error("Thumbnail Game harus diisi.");
      return false;
    }
    const validPairs = pairs.filter(
      (p) => p.term.trim() && p.definition.trim(),
    );
    if (validPairs.length < 2) {
      toast.error("Match Up minimal memiliki 2 pasangan Kata dan Definisi.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Siapkan Payload yang akan dikirim
    const payload: MatchUpPayload = {
      title,
      description: description.trim() || undefined,
      thumbnail: thumbnail,
      pairs: pairs
        .filter((p) => p.term.trim() && p.definition.trim())
        .map((p) => ({
          term: p.term,
          definition: p.definition,
        })),
      isPublishImmediately,
    };

    try {
      const formData = new FormData();

      // Data Umum (mirip Quiz Payload)
      formData.append("thumbnail_image", payload.thumbnail as File);
      formData.append("name", payload.title);
      if (payload.description)
        formData.append("description", payload.description);
      formData.append(
        "is_publish_immediately",
        String(payload.isPublishImmediately),
      );

      // Data Spesifik Match Up
      const contentPayload = { pairs: payload.pairs };
      formData.append("content", JSON.stringify(contentPayload));

      // Kirim data
      const res = await api.post(MATCHUP_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Game Match Up berhasil dibuat!");
      console.log("Response:", res.data);
      window.location.href = `/my-projects`; // Redirect ke My Projects
    } catch (err: unknown) {
      console.error("Gagal membuat Match Up:", err);
      toast.error("Gagal membuat Match Up. Silakan periksa log.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto py-10 px-6">
        <Typography variant="h2" className="mb-6 border-none">
          Create Match Up Game
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* --- INFORMASI DASAR --- */}
          <Card className="p-6 mb-6 shadow-sm">
            <Typography variant="h3" className="mb-4">
              Basic Information
            </Typography>
            <div className="space-y-4">
              <Input
                placeholder="Game Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {/* Asumsi komponen ImageUploader ada dan mengembalikan File */}
              <ImageUploader
                onFileSelect={(file) => setThumbnail(file)}
                currentFile={thumbnail}
                label="Thumbnail Image *"
              />
            </div>
          </Card>

          {/* --- PASANGAN KATA --- */}
          <Card className="p-6 mb-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h3">Word Pairs ({pairs.length})</Typography>
              <Button
                type="button"
                onClick={handleAddPair}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Pair
              </Button>
            </div>

            <div className="space-y-4">
              {pairs.map((pair, index) => (
                <div
                  key={pair.id}
                  className="p-4 border rounded-md bg-white flex flex-col md:flex-row gap-4"
                >
                  <div className="flex-1">
                    <Typography variant="small" className="font-medium mb-1">
                      Term {index + 1} *
                    </Typography>
                    <Input
                      placeholder="e.g., Cat"
                      value={pair.term}
                      onChange={(e) =>
                        handlePairChange(pair.id, "term", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Typography variant="small" className="font-medium mb-1">
                      Definition {index + 1} *
                    </Typography>
                    <Input
                      placeholder="e.g., A domestic animal..."
                      value={pair.definition}
                      onChange={(e) =>
                        handlePairChange(pair.id, "definition", e.target.value)
                      }
                    />
                  </div>
                  {pairs.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="shrink-0 w-8 h-8 self-center md:self-end"
                      onClick={() => handleRemovePair(pair.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* --- SETTINGS --- */}
          <Card className="p-6 mb-6 shadow-sm">
            <Typography variant="h3" className="mb-4">
              Settings
            </Typography>
            <div className="flex items-center justify-between">
              <label htmlFor="publish-toggle" className="text-base font-medium">
                Publish Immediately
                <Typography variant="muted" className="text-sm block">
                  Game will be visible to others immediately after creation.
                </Typography>
              </label>
              <Switch
                id="publish-toggle"
                checked={isPublishImmediately}
                onCheckedChange={setIsPublishImmediately}
              />
            </div>
          </Card>

          {/* --- SUBMIT --- */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving..."
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" /> Create Match Up Game
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
