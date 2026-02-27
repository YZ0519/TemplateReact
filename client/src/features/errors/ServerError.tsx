import { useLocation } from "react-router";

export default function ServerError() {
  const { state } = useLocation();

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {state?.error ? (
        <>
          <h2 className="text-2xl font-bold px-6 pt-5 pb-3 text-gray-800">
            {state.error?.message || "There has been an error"}
          </h2>
          <hr className="border-gray-200" />
          <p className="p-6 text-gray-600 text-sm">
            {state.error?.details || "Internal server error"}
          </p>
        </>
      ) : (
        <p className="p-6 text-gray-700 font-medium">Server error</p>
      )}
    </div>
  );
}
