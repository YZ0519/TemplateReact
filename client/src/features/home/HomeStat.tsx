import { Link } from "react-router";
import { FolderOpen } from "lucide-react";

type Props = {
  count: number | undefined;
  loading: boolean;
};

export default function HomeStat({ count, loading }: Props) {
  return (
    <Link
      to="/projects"
      aria-label="View all projects"
      className="block bg-white border border-gray-200 hover:border-[#218aac] hover:shadow-md transition-all rounded-xl p-8 text-center no-underline group"
    >
      <div className="flex flex-col items-center gap-2">
        <FolderOpen
          className="text-[#218aac] group-hover:text-[#182a73] transition-colors"
          size={48}
          aria-hidden="true"
        />
        <div className="text-6xl font-bold text-gray-900 min-h-[4rem] flex items-center justify-center">
          {loading ? (
            <span
              role="status"
              aria-label="Loading"
              className="inline-block w-8 h-8 border-4 border-[#20a7ac] border-t-transparent rounded-full animate-spin"
            />
          ) : (
            count ?? 0
          )}
        </div>
        <p className="text-gray-500 text-base font-medium uppercase tracking-wide">
          Projects
        </p>
      </div>
    </Link>
  );
}
