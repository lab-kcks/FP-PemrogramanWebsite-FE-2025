import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SpeakingCardData } from "../data";
import { Edit2, Plus, Search, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: SpeakingCardData[];
  onAddCard: () => void;
  onEditCard: (card: SpeakingCardData) => void;
  onDeleteCard: (id: number) => void;
  onResetToDefault: () => void;
}

const CardListDialog = ({
  open,
  onOpenChange,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onResetToDefault,
}: CardListDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = cards.filter(
    (card) =>
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCards = filteredCards.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = [];
    }
    acc[card.category].push(card);
    return acc;
  }, {} as Record<string, SpeakingCardData[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Manage Cards ({cards.length})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={onAddCard} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6 h-[50vh] overflow-auto">
          <div className="space-y-4 pb-4">
            {Object.entries(groupedCards)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([category, categoryCards]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                    {category} ({categoryCards.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryCards.map((card) => (
                      <div
                        key={card.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border bg-card",
                          "hover:border-primary/50 transition-colors group"
                        )}
                      >
                        <p className="flex-1 text-sm">{card.question}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditCard(card)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => onDeleteCard(card.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {filteredCards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No cards found matching your search." : "No cards yet. Add your first card!"}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onResetToDefault}
            className="gap-2 text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardListDialog;
