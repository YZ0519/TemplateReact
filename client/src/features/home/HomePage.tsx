import { useProjectList } from "../../lib/hooks/useProjects";
import HomeStat from "./HomeStat";
import ProjectShowcase from "./ProjectShowcase";

export default function HomePage() {
  const { projects, loadingProjects } = useProjectList();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#182a73] via-[#218aac] to-[#20a7ac] rounded-2xl px-10 py-20 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            My Developer Portfolio
          </h1>
          <p className="text-xl text-white/90 leading-relaxed">
            A curated showcase of projects built with modern fullstack
            technologies. Browse the work, explore the code, and see what's
            been built.
          </p>
        </div>
      </section>

      {/* Stat Card Row */}
      <section className="py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <HomeStat count={projects?.length} loading={loadingProjects} />
          {/* 3 more cards will be added here in future */}
        </div>
      </section>

      {/* Random Project Showcase */}
      <ProjectShowcase projects={projects} loading={loadingProjects} />
    </div>
  );
}
