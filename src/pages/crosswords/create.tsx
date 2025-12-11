import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import Dropzone from "@/components/ui/dropzone";
import { Typography } from "@/components/ui/typography";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import api from "@/api/axios";

interface CrosswordItem {
  word: string;
  clue: string;
}

export default function CreateCrossword() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  // setDescription dihapus dari destructuring karena belum dipakai di JSX user saat ini,
  // atau kita biarkan description saja agar tidak error.
  const [description] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [items, setItems] = useState<CrosswordItem[]>([
    { word: "", clue: "" },
    { word: "", clue: "" },
    { word: "", clue: "" },
    { word: "", clue: "" },
    { word: "", clue: "" },
  ]);

  // State settings dihapus karena belum dipakai logic-nya
  // const [settings, setSettings] = useState({ isPublishImmediately: false });

  const addItem = () => setItems([...items, { word: "", clue: "" }]);
  const removeItem = (index: number) => {
    if (items.length > 5) setItems(items.filter((_, i) => i !== index));
    else toast.error("Minimum 5 words required");
  };

  const handleItemChange = (
    index: number,
    field: "word" | "clue",
    value: string,
  ) => {
    const newItems = [...items];
    newItems[index][field] =
      field === "word" ? value.toUpperCase().replace(/[^A-Z]/g, "") : value;
    setItems(newItems);
  };

  const handleSubmit = async (publish = false) => {
    if (!thumbnail) return toast.error("Thumbnail is required");
    if (!title.trim()) return toast.error("Title is required");

    const validItems = items.filter(
      (i) => i.word.length >= 2 && i.clue.length >= 3,
    );
    if (validItems.length < 5)
      return toast.error("Please provide at least 5 valid words and clues");

    const formData = new FormData();
    formData.append("name", title);
    formData.append("description", description);
    formData.append("thumbnail_image", thumbnail);
    formData.append("is_publish_immediately", String(publish));
    formData.append("items", JSON.stringify(validItems));

    try {
      await api.post("/api/game/game-type/crossword", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Crossword created successfully!");
      navigate("/create-projects");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create game");
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen flex flex-col p-8">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <Button variant="ghost" onClick={() => navigate("/create-projects")}>
          <ArrowLeft /> Back
        </Button>

        <Typography variant="h3">Create Crossword</Typography>

        <div className="bg-white p-6 rounded-xl border space-y-6">
          <FormField
            label="Game Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Dropzone label="Thumbnail" required onChange={setThumbnail} />
        </div>

        <div className="bg-white p-6 rounded-xl border space-y-4">
          <div className="flex justify-between">
            <Typography variant="h4">Words & Clues</Typography>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus /> Add Word
            </Button>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-end border-b pb-4">
              <div className="flex-1">
                <Label>Word (Answer)</Label>
                <input
                  className="w-full border rounded p-2 mt-1 uppercase"
                  value={item.word}
                  onChange={(e) =>
                    handleItemChange(idx, "word", e.target.value)
                  }
                  placeholder="e.g. REACT"
                />
              </div>
              <div className="flex-[2]">
                <Label>Clue (Question)</Label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  value={item.clue}
                  onChange={(e) =>
                    handleItemChange(idx, "clue", e.target.value)
                  }
                  placeholder="e.g. A JavaScript Library"
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-red-500"
                onClick={() => removeItem(idx)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => handleSubmit(false)}>
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(true)}>Publish</Button>
        </div>
      </div>
    </div>
  );
}
