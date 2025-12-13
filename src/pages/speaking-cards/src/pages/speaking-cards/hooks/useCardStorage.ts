import { useState, useEffect, useCallback } from "react";
import { SpeakingCardData, speakingCardsData } from "../data";

const STORAGE_KEY = "speaking-cards-data";

export const useCardStorage = () => {
  const [cards, setCards] = useState<SpeakingCardData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cards from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCards(parsed);
      } catch {
        setCards(speakingCardsData);
      }
    } else {
      setCards(speakingCardsData);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever cards change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, isLoaded]);

  const addCard = useCallback((card: Omit<SpeakingCardData, "id">) => {
    setCards((prev) => {
      const maxId = prev.reduce((max, c) => Math.max(max, c.id), 0);
      return [...prev, { ...card, id: maxId + 1 }];
    });
  }, []);

  const updateCard = useCallback((id: number, updates: Partial<Omit<SpeakingCardData, "id">>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  }, []);

  const deleteCard = useCallback((id: number) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  }, []);

  const resetToDefault = useCallback(() => {
    setCards(speakingCardsData);
  }, []);

  const getCategories = useCallback(() => {
    return [...new Set(cards.map((c) => c.category))];
  }, [cards]);

  return {
    cards,
    setCards,
    isLoaded,
    addCard,
    updateCard,
    deleteCard,
    resetToDefault,
    getCategories,
  };
};

export default useCardStorage;
