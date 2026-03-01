import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useProject } from "../../lib/hooks/useProjects";
import { useAccount } from "../../lib/hooks/useAccount";
import ScreenshotHero from "./components/ScreenshotHero";
import ScreenshotGrid from "./components/ScreenshotGrid";
import TechStackList from "./components/TechStackList";
import FeatureList from "./components/FeatureList";
import ProjectDeleteButton from "./components/ProjectDeleteButton";
import StyledButton from "../../app/shared/components/StyledButton";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { project, loadingProject } = useProject(slug);
  const { currentUser } = useAccount();

  useEffect(() => {
    if (!loadingProject && !project) {
      navigate("/not-found");
    }
  }, [loadingProject, project, navigate]);

  if (loadingProject) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="inline-block w-8 h-8 border-4 border-[#20a7ac] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const sortedScreenshots = [...project.screenshots].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const heroScreenshot = sortedScreenshots[0];
  const gridScreenshots = sortedScreenshots.slice(1);

  return (
    <div className="py-10 space-y-8">
      <Link
        to="/projects"
        className="border border-gray-400 text-gray-600 hover:bg-gray-100 px-3 py-1 text-sm rounded inline-flex items-center gap-1 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </Link>

      {heroScreenshot && (
        <ScreenshotHero
          screenshot={heroScreenshot}
          projectTitle={project.title}
        />
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>

          {currentUser && (
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to={`/projects/${project.slug}/edit`}>
                <StyledButton variant="outlined" size="small">
                  Edit Project
                </StyledButton>
              </Link>
              <ProjectDeleteButton projectId={project.id} />
            </div>
          )}
        </div>

        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
      </div>

      {project.techStacks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Tech Stack</h2>
          <TechStackList items={project.techStacks} grouped />
        </div>
      )}

      {project.features.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Key Features</h2>
          <FeatureList features={project.features} />
        </div>
      )}

      {gridScreenshots.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Screenshots</h2>
          <ScreenshotGrid
            screenshots={gridScreenshots}
            projectTitle={project.title}
          />
        </div>
      )}
    </div>
  );
}
