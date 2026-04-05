import { useState } from "react";
import { useNavigate } from "react-router";
import { useDeleteProject } from "../../../lib/hooks/useProjects";

type Props = {
  projectId: string;
};

export default function ProjectDeleteButton({ projectId }: Props) {
  const navigate = useNavigate();
  const { deleteProject } = useDeleteProject();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    await deleteProject.mutateAsync(projectId);
    navigate("/projects");
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center rounded font-medium transition-colors cursor-pointer border border-red-600 text-red-600 hover:bg-red-50 px-3 py-1 text-sm"
      >
        Delete Project
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 border border-red-200 bg-red-50 rounded px-3 py-1">
      <span className="text-red-700 text-sm">Are you sure? This cannot be undone.</span>
      <button
        onClick={handleDelete}
        disabled={deleteProject.isPending}
        className="inline-flex items-center justify-center rounded font-medium transition-colors cursor-pointer bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1 text-sm"
      >
        {deleteProject.isPending ? "Deleting..." : "Confirm"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="inline-flex items-center justify-center rounded font-medium transition-colors cursor-pointer border border-gray-300 text-gray-600 hover:bg-gray-100 px-3 py-1 text-sm"
      >
        Cancel
      </button>
    </div>
  );
}
