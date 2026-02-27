import { SearchX } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white shadow rounded-lg p-12">
      <SearchX size={80} className="text-blue-500" />
      <h2 className="text-3xl font-bold text-gray-700 text-center">
        Oops — we could not find what you are looking for
      </h2>
      <Link
        to="/"
        className="w-full max-w-xs text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Return to home
      </Link>
    </div>
  );
}
