import { useMemo } from "react";
import type { ProjectSummary } from "../../lib/types";
import ProjectCard from "../projects/components/ProjectCard";

type Props = {
  projects: ProjectSummary[] | undefined;
  loading: boolean;
};

export default function ProjectShowcase({ projects, loading }: Props) {
  const showcaseProject = useMemo(
    () =>
      projects && projects.length > 0
        ? projects[Math.floor(Math.random() * projects.length)]
        : null,
    [projects],
  );

  if (loading) {
    return (
      <section className="py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Project
        </h2>
        <div className="flex justify-center items-center py-16">
          <span
            role="status"
            aria-label="Loading"
            className="inline-block w-8 h-8 border-4 border-[#20a7ac] border-t-transparent rounded-full animate-spin"
          />
        </div>
      </section>
    );
  }

  if (!showcaseProject) {
    return null;
  }

  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Featured Project
      </h2>
      <div className="w-full">
        <div className="relative">
          <ProjectCard project={showcaseProject} />
          <a
            href={`/projects/${showcaseProject.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${showcaseProject.title} in new tab`}
            className="absolute bottom-4 right-4 px-4 py-2 text-sm font-medium text-white bg-[#218aac] rounded hover:opacity-90 transition-opacity"
          >
            More
          </a>
        </div>
      </div>
    </section>
  );
}
