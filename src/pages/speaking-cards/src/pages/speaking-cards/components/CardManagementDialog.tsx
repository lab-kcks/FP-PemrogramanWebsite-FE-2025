import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpeakingCardData } from "../data";
import { Plus } from "lucide-react";

interface CardManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: SpeakingCardData | null;
  categories: string[];
  onSave: (data: { question: string; category: string }) => void;
  onDelete?: () => void;
}

const defaultCategories = [
  "Personal Information",
  "Work & Study",
  "Family",
  "Favorites",
  "Hobbies",
  "Home",
  "Daily Routine",
  "Food & Cooking",
  "Weather",
  "Past Events",
  "Animals",
  "Transportation",
  "Clothes",
  "Sports",
  "Entertainment",
  "Travel",
  "Numbers",
  "Time & Date",
  "Objects",
  "People",
  "Daily Life",
  "Technology",
];

const CardManagementDialog = ({
  open,
  onOpenChange,
  card,
  categories,
  onSave,
  onDelete,
}: CardManagementDialogProps) => {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const allCategories = [...new Set([...defaultCategories, ...categories])].sort();

  useEffect(() => {
    if (card) {
      setQuestion(card.question);
      setCategory(card.category);
      setCustomCategory("");
      setShowCustomCategory(false);
    } else {
      setQuestion("");
      setCategory("");
      setCustomCategory("");
      setShowCustomCategory(false);
    }
  }, [card, open]);

  const handleSave = () => {
    const finalCategory = showCustomCategory ? customCategory.trim() : category;
    if (question.trim() && finalCategory) {
      onSave({ question: question.trim(), category: finalCategory });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {card ? "Edit Card" : "Add New Card"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="Enter your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            {!showCustomCategory ? (
              <div className="flex gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCustomCategory(true)}
                  title="Add custom category"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-2">
          {card && onDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !question.trim() ||
                (!category && !customCategory.trim())
              }
            >
              {card ? "Save Changes" : "Add Card"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardManagementDialog;
