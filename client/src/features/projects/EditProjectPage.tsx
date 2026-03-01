import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import TextInput from "../../app/shared/components/TextInput";
import StyledButton from "../../app/shared/components/StyledButton";
import {
  editProjectSchema,
  type EditProjectSchema,
} from "../../lib/schemas/editProjectSchema";
import { useProject, useUpdateProject } from "../../lib/hooks/useProjects";
import TechStackForm from "./components/TechStackForm";
import FeatureForm from "./components/FeatureForm";
import ScreenshotUploadForm from "./components/ScreenshotUploadForm";

export default function EditProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { project, loadingProject } = useProject(slug);
  const { updateProject } = useUpdateProject();

  const { control, handleSubmit, reset } = useForm<EditProjectSchema>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: { title: "", description: "", displayOrder: 0 },
  });

  useEffect(() => {
    if (!loadingProject && !project) {
      navigate("/not-found");
    }
  }, [loadingProject, project, navigate]);

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        displayOrder: project.displayOrder,
      });
    }
  }, [project, reset]);

  const onSubmit = async (data: EditProjectSchema) => {
    if (!project) return;
    await updateProject.mutateAsync({
      id: project.id,
      slug: project.slug,
      data,
    });
    navigate(`/projects/${project.slug}`);
  };

  if (loadingProject) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="inline-block w-8 h-8 border-4 border-[#20a7ac] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="py-10 pb-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Project</h1>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-1">Slug</p>
            <p className="text-gray-700 bg-gray-100 rounded px-3 py-2 text-sm font-mono">
              {project.slug}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <TextInput
              control={control}
              name="title"
              label="Title"
            />
            <TextInput
              control={control}
              name="description"
              label="Description"
              multiline
              rows={6}
            />
            <TextInput
              control={control}
              name="displayOrder"
              label="Display Order"
              type="number"
            />

            <div className="flex items-center gap-3 pt-2">
              <StyledButton
                type="submit"
                variant="contained"
                loading={updateProject.isPending}
              >
                Save Changes
              </StyledButton>
              <StyledButton
                type="button"
                variant="text"
                onClick={() => navigate(`/projects/${project.slug}`)}
              >
                Cancel
              </StyledButton>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <TechStackForm
            projectId={project.id}
            techStack={project.techStacks}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <FeatureForm
            projectId={project.id}
            features={project.features}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-8">
          <ScreenshotUploadForm
            projectId={project.id}
            screenshots={project.screenshots}
          />
        </div>
      </div>
    </div>
  );
}
