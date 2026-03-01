import type { ProjectFeature } from "../../../lib/types";

type Props = {
  features: ProjectFeature[];
};

export default function FeatureList({ features }: Props) {
  if (features.length === 0) return null;

  const sorted = [...features].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <ul className="list-disc list-inside space-y-1 text-gray-600">
      {sorted.map((feature) => (
        <li key={feature.id}>{feature.description}</li>
      ))}
    </ul>
  );
}
