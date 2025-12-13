import { cn } from "@/lib/utils";
import { MessageCircle, Mic, MicOff, RotateCcw, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

interface SpeakingCardProps {
  question: string;
  category: string;
  isFlipped: boolean;
  onFlip: () => void;
  cardNumber: number;
  onMicStart?: () => void;
  onMicStop?: () => void;
}

// Card theme colors based on category
const getCategoryTheme = (category: string) => {
  const themes: Record<string, { gradient: string; accent: string; icon: string }> = {
    "Daily Life": { gradient: "from-[hsl(var(--game-coral))] to-[hsl(var(--accent))]", accent: "hsl(var(--game-coral))", icon: "🌟" },
    "Hobbies": { gradient: "from-[hsl(var(--game-green))] to-[hsl(var(--secondary))]", accent: "hsl(var(--game-green))", icon: "🎯" },
    "Travel": { gradient: "from-[hsl(var(--game-blue))] to-[hsl(var(--primary))]", accent: "hsl(var(--game-blue))", icon: "✈️" },
    "Food": { gradient: "from-[hsl(var(--game-yellow))] to-[hsl(var(--game-coral))]", accent: "hsl(var(--game-yellow))", icon: "🍕" },
    "Technology": { gradient: "from-[hsl(var(--primary))] to-[hsl(var(--game-pink))]", accent: "hsl(var(--primary))", icon: "💡" },
    "Entertainment": { gradient: "from-[hsl(var(--game-pink))] to-[hsl(var(--primary))]", accent: "hsl(var(--game-pink))", icon: "🎬" },
  };
  return themes[category] || { gradient: "from-[hsl(var(--primary))] to-[hsl(var(--secondary))]", accent: "hsl(var(--primary))", icon: "💬" };
};

const SpeakingCard = ({ 
  question, 
  category, 
  isFlipped, 
  onFlip, 
  cardNumber,
  onMicStart,
  onMicStop,
}: SpeakingCardProps) => {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  } = useSpeechRecognition();

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) {
      stopListening();
      onMicStop?.();
    } else {
      startListening();
      onMicStart?.();
    }
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetTranscript();
  };

  return (
    <div
      className={cn(
        "w-full h-full cursor-pointer transition-transform duration-700 transform-style-3d",
        isFlipped && "rotate-y-180"
      )}
      onClick={onFlip}
      style={{
        transformStyle: "preserve-3d",
        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
    >
      {/* Card Back */}
      <div
        className="absolute inset-0 rounded-3xl shadow-2xl backface-hidden overflow-hidden"
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="w-full h-full bg-gradient-to-br from-primary via-[hsl(var(--game-pink))] to-secondary rounded-3xl p-6 flex flex-col items-center justify-center border-4 border-primary-foreground/30 relative">
          {/* Decorative floating shapes */}
          <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-primary-foreground/20 animate-float" />
          <div className="absolute top-8 right-8 w-6 h-6 rounded-lg bg-primary-foreground/15 rotate-45 animate-bounce-slow" />
          <div className="absolute bottom-12 left-8 w-5 h-5 rounded-full bg-primary-foreground/20 animate-float" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-1/4 right-4 w-4 h-4 rounded-full bg-primary-foreground/25 animate-bounce-slow" style={{ animationDelay: "1s" }} />
          
          {/* Decorative pattern borders */}
          <div className="absolute inset-4 border-2 border-primary-foreground/30 rounded-2xl" />
          <div className="absolute inset-8 border border-primary-foreground/20 rounded-xl border-dashed" />
          
          {/* Corner decorations */}
          <Star className="absolute top-6 left-6 w-5 h-5 text-primary-foreground/40" />
          <Sparkles className="absolute top-6 right-6 w-5 h-5 text-primary-foreground/40" />
          <Zap className="absolute bottom-16 left-6 w-5 h-5 text-primary-foreground/40" />
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm border-2 border-primary-foreground/30 shadow-lg">
              <MessageCircle className="w-10 h-10 text-primary-foreground drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-bold text-primary-foreground text-center drop-shadow-md">
              Speaking Cards
            </h2>
            <p className="text-primary-foreground/90 text-sm bg-primary-foreground/10 px-4 py-1 rounded-full backdrop-blur-sm">
              Tap to reveal
            </p>
          </div>

          {/* Card number badge */}
          <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary-foreground/25 flex items-center justify-center backdrop-blur-sm border-2 border-primary-foreground/30 shadow-lg">
            <span className="text-primary-foreground font-bold text-sm">
              #{cardNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Card Front (Question) */}
      {(() => {
        const theme = getCategoryTheme(category);
        return (
          <div
            className="absolute inset-0 rounded-3xl shadow-2xl backface-hidden overflow-hidden"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <div className="w-full h-full bg-card rounded-3xl p-4 flex flex-col border-4 border-primary/30 relative">
              {/* Decorative top gradient bar */}
              <div className={cn("absolute top-0 left-0 right-0 h-2 rounded-t-2xl bg-gradient-to-r", theme.gradient)} />
              
              {/* Decorative corner shapes */}
              <div className="absolute top-3 right-3 w-16 h-16 rounded-full opacity-10 bg-gradient-to-br from-primary to-secondary" />
              <div className="absolute bottom-20 left-3 w-12 h-12 rounded-full opacity-10 bg-gradient-to-br from-secondary to-accent" />
              
              {/* Category badge */}
              <div className="flex justify-between items-start mb-2 mt-1">
                <span className={cn(
                  "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-primary-foreground bg-gradient-to-r shadow-md",
                  theme.gradient
                )}>
                  <span>{theme.icon}</span>
                  {category}
                </span>
                <span className="text-muted-foreground text-sm font-bold bg-muted/50 px-2 py-1 rounded-lg">
                  #{cardNumber}
                </span>
              </div>

              {/* Question with decorative quote marks */}
              <div className="flex-1 flex items-center justify-center px-4 min-h-0 relative">
                <span className="absolute top-0 left-2 text-4xl text-primary/20 font-serif">"</span>
                <p className="text-lg md:text-xl font-semibold text-card-foreground text-center leading-relaxed px-4">
                  {question}
                </p>
                <span className="absolute bottom-0 right-2 text-4xl text-primary/20 font-serif">"</span>
              </div>

          {/* Speech Recognition Section */}
          {isSupported && (
            <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              {/* Transcript Display */}
              {transcript && (
                <div className="bg-muted/50 rounded-xl p-2 max-h-16 overflow-y-auto">
                  <p className="text-xs text-foreground">{transcript}</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <p className="text-xs text-destructive text-center">
                  {error === "not-allowed" ? "Please allow microphone access" : error}
                </p>
              )}

              {/* Mic Controls */}
              <div className="flex justify-center gap-2">
                <Button
                  size="sm"
                  variant={isListening ? "destructive" : "default"}
                  className={cn(
                    "rounded-full transition-all",
                    isListening && "animate-pulse"
                  )}
                  onClick={handleMicClick}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-1" />
                      Speak
                    </>
                  )}
                </Button>
                {transcript && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={handleResetClick}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

              {/* Not supported message */}
              {!isSupported && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Speech recognition not supported in this browser
                </p>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default SpeakingCard;
