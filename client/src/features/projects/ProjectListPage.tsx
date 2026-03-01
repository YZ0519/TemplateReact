import { Link } from "react-router";
import { useProjectList } from "../../lib/hooks/useProjects";
import { useAccount } from "../../lib/hooks/useAccount";
import ProjectCard from "./components/ProjectCard";
import StyledButton from "../../app/shared/components/StyledButton";

export default function ProjectListPage() {
  const { projects, loadingProjects } = useProjectList();
  const { currentUser } = useAccount();

  const sorted = projects
    ? [...projects].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        {currentUser && (
          <Link to="/projects/create">
            <StyledButton variant="outlined" size="small">
              Add Project
            </StyledButton>
          </Link>
        )}
      </div>

      {loadingProjects && (
        <div className="flex justify-center py-20">
          <span className="inline-block w-8 h-8 border-4 border-[#20a7ac] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loadingProjects && sorted.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-600 text-lg">No projects yet.</p>
          {currentUser && (
            <p className="text-gray-500 text-sm mt-2">
              Get started by adding your first project.
            </p>
          )}
        </div>
      )}

      {!loadingProjects && sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
