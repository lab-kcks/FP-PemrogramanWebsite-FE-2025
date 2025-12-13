import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, CreditCard } from "lucide-react";

interface ExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  timer: string;
  cardsDealt: number;
}

const ExitDialog = ({
  open,
  onOpenChange,
  onConfirm,
  timer,
  cardsDealt,
}: ExitDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-2xl">
            Exit Game?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Are you sure you want to exit the game?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Game Stats */}
        <div className="flex justify-center gap-6 py-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Time</span>
            <span className="text-lg font-bold text-foreground">{timer}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Cards Dealt</span>
            <span className="text-lg font-bold text-foreground">{cardsDealt}</span>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            Continue Playing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
          >
            Exit Game
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExitDialog;
