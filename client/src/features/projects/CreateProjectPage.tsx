import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import TextInput from "../../app/shared/components/TextInput";
import StyledButton from "../../app/shared/components/StyledButton";
import {
  createProjectSchema,
  type CreateProjectSchema,
} from "../../lib/schemas/createProjectSchema";
import { useCreateProject } from "../../lib/hooks/useProjects";

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { createProject } = useCreateProject();

  const { control, handleSubmit } = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      displayOrder: 0,
    },
  });

  const onSubmit = async (data: CreateProjectSchema) => {
    const project = await createProject.mutateAsync(data);
    navigate(`/projects/${project.slug}`);
  };

  return (
    <div className="py-10">
      <div className="bg-white shadow rounded-lg p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Project</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextInput
            control={control}
            name="title"
            label="Title"
            placeholder="e.g. Info Portal"
          />
          <TextInput
            control={control}
            name="description"
            label="Description"
            placeholder="Describe the project..."
            multiline
            rows={6}
          />
          <TextInput
            control={control}
            name="displayOrder"
            label="Display Order"
            type="number"
            placeholder="0"
          />

          <div className="flex items-center gap-3 pt-2">
            <StyledButton
              type="submit"
              variant="contained"
              loading={createProject.isPending}
            >
              Create Project
            </StyledButton>
            <StyledButton
              type="button"
              variant="text"
              onClick={() => navigate("/projects")}
            >
              Cancel
            </StyledButton>
          </div>
        </form>
      </div>
    </div>
  );
}
