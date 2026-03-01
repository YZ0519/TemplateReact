import type { TechStackItem } from "../../../lib/types";
import TechStackBadge from "./TechStackBadge";

type Props = {
  items: TechStackItem[];
  grouped?: boolean;
};

export default function TechStackList({ items, grouped = false }: Props) {
  if (items.length === 0) return null;

  if (!grouped) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <TechStackBadge key={item.id} item={item} />
        ))}
      </div>
    );
  }

  const groups = items.reduce<Record<string, TechStackItem[]>>((acc, item) => {
    const key = item.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([category, groupItems]) => (
        <div key={category}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
            {category}
          </p>
          <div className="flex flex-wrap gap-2">
            {groupItems.map((item) => (
              <TechStackBadge key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
