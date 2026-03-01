import { useNavigate } from "react-router";
import type { ProjectSummary } from "../../../lib/types";
import TechStackList from "./TechStackList";

type Props = {
  project: ProjectSummary;
};

export default function ProjectCard({ project }: Props) {
  const navigate = useNavigate();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/${project.slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/projects/${project.slug}`);
        }
      }}
      className="bg-white border border-gray-200 hover:border-[#218aac] hover:shadow-md transition-all rounded-xl p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#20a7ac]"
      aria-label={`View ${project.title}`}
    >
      {project.heroScreenshotUrl && (
        <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
          <img
            src={project.heroScreenshotUrl}
            alt={project.title}
            className="object-contain w-full h-full"
          />
        </div>
      )}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h2>
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
        {project.description}
      </p>
      <TechStackList items={project.techStacks} grouped />
    </div>
  );
}
