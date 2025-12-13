import { Button } from "@/components/ui/button";
import { 
  X, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX,
  Clock
} from "lucide-react";

interface GameHeaderProps {
  timer: string;
  isPaused: boolean;
  onPause: () => void;
  onExit: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  cardsDealt: number;
  totalCards: number;
}

const GameHeader = ({
  timer,
  isPaused,
  onPause,
  onExit,
  isSoundEnabled,
  onToggleSound,
  cardsDealt,
  totalCards,
}: GameHeaderProps) => {
  return (
    <header className="flex items-center justify-between">
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onExit}
        className="rounded-full hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Title & Timer */}
      <div className="flex flex-col items-center">
        <h1 className="text-xl font-bold text-foreground">Speaking Cards</h1>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-mono text-foreground">{timer}</span>
          {isPaused && (
            <span className="text-xs text-amber-500 font-medium">(Paused)</span>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSound}
          className="rounded-full"
        >
          {isSoundEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onPause}
          className="rounded-full"
        >
          {isPaused ? (
            <Play className="h-5 w-5" />
          ) : (
            <Pause className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default GameHeader;
