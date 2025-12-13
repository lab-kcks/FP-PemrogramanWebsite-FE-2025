import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";
import SpeakingCard from "./components/SpeakingCard";
import GameHeader from "./components/GameHeader";
import GameControls from "./components/GameControls";
import ExitDialog from "./components/ExitDialog";
import CardManagementDialog from "./components/CardManagementDialog";
import CardListDialog from "./components/CardListDialog";
import useGameSounds from "./hooks/useGameSounds";
import useCardStorage from "./hooks/useCardStorage";
import { SpeakingCardData } from "./data";

const SpeakingCardsGame = () => {
  const navigate = useNavigate();
  const {
    cards,
    setCards,
    isLoaded,
    addCard,
    updateCard,
    deleteCard,
    resetToDefault,
    getCategories,
  } = useCardStorage();

  const [displayCards, setDisplayCards] = useState<SpeakingCardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dealtCards, setDealtCards] = useState<number[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  // Card management state
  const [showCardList, setShowCardList] = useState(false);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [editingCard, setEditingCard] = useState<SpeakingCardData | null>(null);

  const sounds = useGameSounds(isSoundEnabled);

  // Sync display cards with storage
  useEffect(() => {
    if (isLoaded) {
      setDisplayCards([...cards]);
    }
  }, [cards, isLoaded]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameStarted && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const shuffleCards = useCallback(() => {
    sounds.playShuffle();
    const shuffled = [...displayCards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffled);
    setCurrentCardIndex(0);
    setDealtCards([]);
    setIsFlipped(false);
  }, [displayCards, sounds]);

  const dealCard = () => {
    if (!isGameStarted) {
      setIsGameStarted(true);
    }
    if (!dealtCards.includes(currentCardIndex)) {
      setDealtCards([...dealtCards, currentCardIndex]);
    }
    sounds.playCardFlip();
    setIsFlipped(true);
  };

  const nextCard = () => {
    if (currentCardIndex < displayCards.length - 1) {
      sounds.playNavigation();
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      sounds.playNavigation();
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const resetGame = () => {
    sounds.playButtonClick();
    setCurrentCardIndex(0);
    setDealtCards([]);
    setIsFlipped(false);
    setTimer(0);
    setIsPaused(false);
    setIsGameStarted(false);
    setDisplayCards([...cards]);
  };

  const handleExit = async () => {
    try {
      await fetch("/api/game/speaking-cards/play-count", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Failed to update play count:", error);
    }
    navigate("/");
  };

  const togglePause = () => {
    sounds.playButtonClick();
    setIsPaused(!isPaused);
  };

  const toggleSound = () => {
    // Play sound before toggling off
    if (isSoundEnabled) {
      sounds.playButtonClick();
    }
    setIsSoundEnabled(!isSoundEnabled);
    // Play sound after toggling on
    if (!isSoundEnabled) {
      setTimeout(() => sounds.playSuccess(), 50);
    }
  };

  // Card management handlers
  const handleOpenAddCard = () => {
    setEditingCard(null);
    setShowCardEditor(true);
  };

  const handleEditCard = (card: SpeakingCardData) => {
    setEditingCard(card);
    setShowCardList(false);
    setShowCardEditor(true);
  };

  const handleSaveCard = (data: { question: string; category: string }) => {
    sounds.playSuccess();
    if (editingCard) {
      updateCard(editingCard.id, data);
    } else {
      addCard(data);
    }
    setEditingCard(null);
  };

  const handleDeleteCard = (id: number) => {
    sounds.playButtonClick();
    deleteCard(id);
    // Adjust current index if needed
    if (currentCardIndex >= displayCards.length - 1 && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleResetToDefault = () => {
    sounds.playButtonClick();
    resetToDefault();
    setCurrentCardIndex(0);
    setDealtCards([]);
    setIsFlipped(false);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        <GameHeader
          timer={formatTime(timer)}
          isPaused={isPaused}
          onPause={togglePause}
          onExit={() => setShowExitDialog(true)}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={toggleSound}
          cardsDealt={dealtCards.length}
          totalCards={displayCards.length}
        />

        {/* Manage Cards Button */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCardList(true)}
            className="gap-2"
          >
            <Settings2 className="h-4 w-4" />
            Manage Cards
          </Button>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col items-center justify-center mt-8 mb-8">
          {/* Card Counter */}
          <div className="mb-6 text-center">
            <p className="text-muted-foreground text-sm mb-1">Card</p>
            <p className="text-2xl font-bold text-foreground">
              {displayCards.length > 0 ? `${currentCardIndex + 1} / ${displayCards.length}` : "0 / 0"}
            </p>
          </div>

          {/* Card Display */}
          {displayCards.length > 0 ? (
            <div className="relative w-full max-w-md aspect-[3/4] perspective-1000">
              <SpeakingCard
                question={displayCards[currentCardIndex]?.question || ""}
                category={displayCards[currentCardIndex]?.category || ""}
                isFlipped={isFlipped}
                onFlip={() => !isFlipped && dealCard()}
                cardNumber={currentCardIndex + 1}
                onMicStart={sounds.playMicStart}
                onMicStop={sounds.playMicStop}
              />
            </div>
          ) : (
            <div className="w-full max-w-md aspect-[3/4] flex items-center justify-center bg-card rounded-3xl border-4 border-dashed border-muted">
              <div className="text-center p-6">
                <p className="text-muted-foreground mb-4">No cards available</p>
                <Button onClick={handleOpenAddCard}>Add Your First Card</Button>
              </div>
            </div>
          )}

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevCard}
              disabled={currentCardIndex === 0 || displayCards.length === 0}
              className="rounded-full h-12 w-12 border-2"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              onClick={dealCard}
              disabled={isFlipped || displayCards.length === 0}
              className="px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isFlipped ? "Card Dealt" : "Deal Card"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={nextCard}
              disabled={currentCardIndex === displayCards.length - 1 || displayCards.length === 0}
              className="rounded-full h-12 w-12 border-2"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <GameControls
          onShuffle={shuffleCards}
          onReset={resetGame}
        />
      </div>

      <ExitDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        onConfirm={handleExit}
        timer={formatTime(timer)}
        cardsDealt={dealtCards.length}
      />

      <CardListDialog
        open={showCardList}
        onOpenChange={setShowCardList}
        cards={cards}
        onAddCard={handleOpenAddCard}
        onEditCard={handleEditCard}
        onDeleteCard={handleDeleteCard}
        onResetToDefault={handleResetToDefault}
      />

      <CardManagementDialog
        open={showCardEditor}
        onOpenChange={setShowCardEditor}
        card={editingCard}
        categories={getCategories()}
        onSave={handleSaveCard}
        onDelete={editingCard ? () => handleDeleteCard(editingCard.id) : undefined}
      />
    </div>
  );
};

export default SpeakingCardsGame;
