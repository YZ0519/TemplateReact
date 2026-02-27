import { Star } from "lucide-react";

type Props = {
  selected: boolean;
  onClick?: () => void;
};

export default function StarButton({ selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="p-1 transition-colors hover:opacity-80"
    >
      <Star
        size={24}
        fill={selected ? "gold" : "none"}
        stroke={selected ? "gold" : "white"}
      />
    </button>
  );
}
