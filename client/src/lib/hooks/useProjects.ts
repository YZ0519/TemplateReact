import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import agent from "../api/agent";
import type {
  ProjectDetail,
  ProjectFeature,
  ProjectScreenshot,
  ProjectSummary,
  TechStackItem,
} from "../types";
import type { CreateProjectSchema } from "../schemas/createProjectSchema";
import type { EditProjectSchema } from "../schemas/editProjectSchema";
import type { AddTechStackSchema } from "../schemas/addTechStackSchema";
import type { AddFeatureSchema } from "../schemas/addFeatureSchema";

const STALE_5_MINUTES = 5 * 60 * 1000;

export const useProjectList = () => {
  const { data: projects, isLoading: loadingProjects } = useQuery<
    ProjectSummary[]
  >({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await agent.get<ProjectSummary[]>("/projects");
      return response.data;
    },
    staleTime: STALE_5_MINUTES,
  });

  return { projects, loadingProjects };
};

export const useProject = (slug?: string) => {
  const { data: project, isLoading: loadingProject } = useQuery<ProjectDetail>(
    {
      queryKey: ["project", slug],
      queryFn: async () => {
        const response = await agent.get<ProjectDetail>(`/projects/${slug}`);
        return response.data;
      },
      enabled: !!slug,
      staleTime: STALE_5_MINUTES,
    },
  );

  return { project, loadingProject };
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: async (data: CreateProjectSchema) => {
      const response = await agent.post<ProjectDetail>("/projects", data);
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return { createProject };
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  const updateProject = useMutation({
    mutationFn: async ({
      id,
      slug,
      data,
    }: {
      id: string;
      slug: string;
      data: EditProjectSchema;
    }) => {
      await agent.put(`/projects/${id}`, data);
      return slug;
    },
    onSuccess: async (slug: string) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["project", slug] });
    },
  });

  return { updateProject };
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      await agent.delete(`/projects/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.invalidateQueries({ queryKey: ["project"], exact: false });
    },
  });

  return { deleteProject };
};

export const useAddTechStack = (projectId: string) => {
  const queryClient = useQueryClient();

  const addTechStack = useMutation({
    mutationFn: async (data: AddTechStackSchema) => {
      const response = await agent.post<TechStackItem>(
        `/projects/${projectId}/tech-stack`,
        data,
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project"],
        exact: false,
      });
    },
  });

  return { addTechStack };
};

export const useRemoveTechStack = (projectId: string) => {
  const queryClient = useQueryClient();

  const removeTechStack = useMutation({
    mutationFn: async (itemId: string) => {
      await agent.delete(`/projects/${projectId}/tech-stack/${itemId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project"],
        exact: false,
      });
    },
  });

  return { removeTechStack };
};

export const useAddFeature = (projectId: string) => {
  const queryClient = useQueryClient();

  const addFeature = useMutation({
    mutationFn: async (data: AddFeatureSchema) => {
      const response = await agent.post<ProjectFeature>(
        `/projects/${projectId}/features`,
        data,
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project"],
        exact: false,
      });
    },
  });

  return { addFeature };
};

export const useRemoveFeature = (projectId: string) => {
  const queryClient = useQueryClient();

  const removeFeature = useMutation({
    mutationFn: async (featureId: string) => {
      await agent.delete(`/projects/${projectId}/features/${featureId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project"],
        exact: false,
      });
    },
  });

  return { removeFeature };
};

export const useAddScreenshot = (projectId: string) => {
  const queryClient = useQueryClient();

  const addScreenshot = useMutation({
    mutationFn: async ({
      file,
      caption,
      displayOrder,
    }: {
      file: File;
      caption?: string;
      displayOrder: number;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (caption) formData.append("caption", caption);
      formData.append("displayOrder", String(displayOrder));

      const response = await agent.post<ProjectScreenshot>(
        `/projects/${projectId}/screenshots`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project"],
        exact: false,
      });
    },
  });

  return { addScreenshot };
};

export const useRemoveScreenshot = (projectId: string) => {
  const queryClient = useQueryClient();

  const removeScreenshot = useMutation({
    mutationFn: async (screenshotId: string) => {
      await agent.delete(
        `/projects/${projectId}/screenshots/${screenshotId}`,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project"],
        exact: false,
      });
    },
  });

  return { removeScreenshot };
};
