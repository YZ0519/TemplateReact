import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import TextInput from "../../../app/shared/components/TextInput";
import StyledButton from "../../../app/shared/components/StyledButton";
import {
  addFeatureSchema,
  type AddFeatureSchema,
} from "../../../lib/schemas/addFeatureSchema";
import { useAddFeature, useRemoveFeature } from "../../../lib/hooks/useProjects";
import type { ProjectFeature } from "../../../lib/types";

type Props = {
  projectId: string;
  features: ProjectFeature[];
};

export default function FeatureForm({ projectId, features }: Props) {
  const { addFeature } = useAddFeature(projectId);
  const { removeFeature } = useRemoveFeature(projectId);

  const { control, handleSubmit, reset } = useForm<AddFeatureSchema>({
    resolver: zodResolver(addFeatureSchema),
    defaultValues: { description: "", displayOrder: 0 },
  });

  const onSubmit = async (data: AddFeatureSchema) => {
    await addFeature.mutateAsync(data);
    reset();
  };

  const sorted = [...features].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Key Features</h3>

      {sorted.length > 0 ? (
        <ul className="space-y-2">
          {sorted.map((feature) => (
            <li
              key={feature.id}
              className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 gap-3"
            >
              <span className="text-gray-700 text-sm flex-1">
                {feature.description}
              </span>
              <button
                onClick={() => removeFeature.mutate(feature.id)}
                disabled={removeFeature.isPending}
                aria-label={`Remove feature: ${feature.description}`}
                className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded flex-shrink-0 mt-0.5"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No features added yet.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <TextInput
              control={control}
              name="description"
              label="Feature Description"
              placeholder="e.g. Real-time dashboard updates"
            />
          </div>
          <TextInput
            control={control}
            name="displayOrder"
            label="Display Order"
            type="number"
            placeholder="0"
          />
        </div>
        <StyledButton
          type="submit"
          variant="outlined"
          size="small"
          loading={addFeature.isPending}
        >
          Add Feature
        </StyledButton>
      </form>
    </div>
  );
}
