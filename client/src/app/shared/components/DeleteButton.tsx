import { Trash2 } from "lucide-react";

type Props = {
  onClick?: () => void;
  loading?: boolean;
};

export default function DeleteButton({ onClick, loading }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      <Trash2 size={22} />
    </button>
  );
}
