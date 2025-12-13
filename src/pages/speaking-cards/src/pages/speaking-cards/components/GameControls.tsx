import { Button } from "@/components/ui/button";
import { RotateCcw, Shuffle } from "lucide-react";

interface GameControlsProps {
  onShuffle: () => void;
  onReset: () => void;
}

const GameControls = ({ onShuffle, onReset }: GameControlsProps) => {
  return (
    <div className="flex justify-center gap-4">
      <Button
        variant="secondary"
        onClick={onShuffle}
        className="gap-2 rounded-full px-6"
      >
        <Shuffle className="h-4 w-4" />
        Shuffle
      </Button>
      <Button
        variant="outline"
        onClick={onReset}
        className="gap-2 rounded-full px-6"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
};

export default GameControls;
