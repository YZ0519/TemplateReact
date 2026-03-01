import type { TechStackItem } from "../../../lib/types";

type Props = {
  item: TechStackItem;
};

export default function TechStackBadge({ item }: Props) {
  return (
    <span className="bg-[#182a73]/10 text-[#182a73] border border-[#182a73]/30 rounded-full px-3 py-1 text-sm">
      {item.name}
    </span>
  );
}
