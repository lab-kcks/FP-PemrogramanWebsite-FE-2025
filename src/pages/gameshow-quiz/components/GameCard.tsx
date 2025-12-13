interface GameData {
  id: string;
  name?: string;
  title?: string;
  description?: string;
}

interface GameCardProps {
  game: GameData;
  onPlay?: () => void;
  onEdit?: () => void;
}

const GameCard = ({ game, onPlay, onEdit }: GameCardProps) => {
  return (
    <div className="border p-4 rounded">
      <h3 className="font-bold">{game.name || game.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{game.description}</p>
      <div className="flex gap-2">
        {onPlay && (
          <button
            onClick={onPlay}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
          >
            Play
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default GameCard;
