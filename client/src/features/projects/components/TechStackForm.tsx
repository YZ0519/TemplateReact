import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import TextInput from "../../../app/shared/components/TextInput";
import SelectInput from "../../../app/shared/components/SelectInput";
import StyledButton from "../../../app/shared/components/StyledButton";
import {
  addTechStackSchema,
  type AddTechStackSchema,
} from "../../../lib/schemas/addTechStackSchema";
import { useAddTechStack, useRemoveTechStack } from "../../../lib/hooks/useProjects";
import type { TechStackItem } from "../../../lib/types";

const CATEGORY_OPTIONS = [
  { text: "Frontend", value: "Frontend" },
  { text: "Backend", value: "Backend" },
  { text: "Database", value: "Database" },
  { text: "DevOps", value: "DevOps" },
  { text: "Other", value: "Other" },
];

type Props = {
  projectId: string;
  techStack: TechStackItem[];
};

export default function TechStackForm({ projectId, techStack }: Props) {
  const { addTechStack } = useAddTechStack(projectId);
  const { removeTechStack } = useRemoveTechStack(projectId);

  const { control, handleSubmit, reset } = useForm<AddTechStackSchema>({
    resolver: zodResolver(addTechStackSchema),
    defaultValues: { name: "", category: "" },
  });

  const onSubmit = async (data: AddTechStackSchema) => {
    await addTechStack.mutateAsync(data);
    reset();
  };

  const sorted = [...techStack].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Tech Stack</h3>

      {sorted.length > 0 ? (
        <ul className="space-y-2">
          {sorted.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
            >
              <div>
                <span className="text-gray-900 text-sm font-medium">{item.name}</span>
                <span className="text-gray-500 text-xs ml-2">({item.category})</span>
              </div>
              <button
                onClick={() => removeTechStack.mutate(item.id)}
                disabled={removeTechStack.isPending}
                aria-label={`Remove ${item.name}`}
                className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm">No tech stack items added yet.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            control={control}
            name="name"
            label="Name"
            placeholder="e.g. React"
          />
          <SelectInput
            control={control}
            name="category"
            label="Category"
            items={CATEGORY_OPTIONS}
          />
        </div>
        <StyledButton
          type="submit"
          variant="outlined"
          size="small"
          loading={addTechStack.isPending}
        >
          Add Tech Stack Item
        </StyledButton>
      </form>
    </div>
  );
}
