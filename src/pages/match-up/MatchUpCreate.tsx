// src/pages/match-up/MatchUpCreate.tsx

import React, { useState } from "react";
// Asumsikan Anda mengimpor komponen UI dari ShadCN/UI
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';

// Interface untuk menampung satu pasangan Kata-Definisi
interface MatchUpPair {
  id: number;
  term: string;
  definition: string;
}

const MatchUpCreate: React.FC = () => {
  // State untuk Informasi Dasar Game
  const [gameTitle, setGameTitle] = useState("");
  const [description, setDescription] = useState("");

  // State untuk Daftar Pasangan Kata-Definisi
  const [pairs, setPairs] = useState<MatchUpPair[]>([
    { id: Date.now(), term: "", definition: "" },
  ]);

  // Fungsi untuk menambah pasangan baru
  const addPair = () => {
    setPairs([...pairs, { id: Date.now(), term: "", definition: "" }]);
  };

  // Fungsi untuk mengupdate nilai pasangan (Kata atau Definisi)
  const updatePair = (
    id: number,
    field: "term" | "definition",
    value: string,
  ) => {
    setPairs(
      pairs.map((pair) =>
        pair.id === id ? { ...pair, [field]: value } : pair,
      ),
    );
  };

  // Fungsi utama saat tombol Save Game ditekan
  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi data (opsional, tapi disarankan)
    // ...

    // 2. Persiapkan payload POST API
    const gameData = {
      gameTemplateSlug: "match-up", // Slug game Anda
      title: gameTitle,
      description: description,
      // Data 'content' yang akan disimpan di backend
      content: {
        pairs: pairs.map(({ term, definition }) => ({ term, definition })), // Hapus 'id' sementara
      },
      // Pengaturan lain (misalnya publishImmediately)
      isPublished: true, // Contoh: Atur berdasarkan toggle switch di UI
    };

    console.log("Data yang akan dikirim ke Backend:", gameData);

    // 3. Panggil API POST ke Backend
    // Di sini Anda akan menggunakan VITE_API_URL untuk request POST /game
    // Contoh:
    /*
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token_login>' },
        body: JSON.stringify(gameData)
      });
      if (response.ok) {
        alert('Game berhasil dibuat!');
        // Redirect ke My Projects
      } else {
        alert('Gagal membuat game.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    */
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Match Up Game</h1>
      <p className="mb-8 text-gray-500">Cocokkan kata dengan definisinya.</p>

      <form onSubmit={handleSaveGame}>
        {/* Basic Information Section */}
        <section className="mb-8 p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <label htmlFor="title">Game Title *</label>
            <input
              id="title"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="Example: Kitchen Tools"
              className="w-full p-2 border rounded"
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this game..."
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </section>

        {/* Question/Pair List Section */}
        <section className="mb-8 p-4 border rounded-md">
          <h2 className="text-xl font-semibold mb-4">Match Up List</h2>
          <p className="mb-4">Total: {pairs.length} Pasangan</p>

          {pairs.map((pair, index) => (
            <div
              key={pair.id}
              className="grid grid-cols-2 gap-4 p-4 mb-4 border rounded bg-gray-50"
            >
              <div>
                <label className="font-medium">
                  Term / Kata #{index + 1} *
                </label>
                <input
                  value={pair.term}
                  onChange={(e) => updatePair(pair.id, "term", e.target.value)}
                  placeholder="e.g., Spatula"
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
              <div>
                <label className="font-medium">
                  Definition / Definisi #{index + 1} *
                </label>
                <input
                  value={pair.definition}
                  onChange={(e) =>
                    updatePair(pair.id, "definition", e.target.value)
                  }
                  placeholder="e.g., Alat pembalik makanan"
                  className="w-full p-2 border rounded mt-1"
                />
              </div>
            </div>
          ))}

          {/* Tombol Add New Question */}
          <button
            type="button"
            onClick={addPair}
            className="w-full p-2 border border-dashed rounded text-blue-600 hover:bg-blue-50 transition mt-4"
          >
            + Add New Pair
          </button>
        </section>

        {/* Game Settings (Optional, bisa diletakkan di samping) */}
        {/* Anda bisa menambahkan toggle Publish Immediately, dll. di sini */}

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition"
          >
            Save Game
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchUpCreate;
