import { useMutation } from "@tanstack/react-query";
import agent from "../../lib/api/agent.ts";
import { useState } from "react";

export default function TestErrors() {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { mutate } = useMutation({
    mutationFn: async ({
      path,
      method = "get",
    }: {
      path: string;
      method: string;
    }) => {
      if (method === "post") await agent.post(path, {});
      else await agent.get(path);
    },
    onError: (err) => {
      if (Array.isArray(err)) {
        setValidationErrors(err);
      } else {
        setValidationErrors([]);
      }
    },
  });

  const handleError = (path: string, method = "get") => {
    mutate({ path, method });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Test errors component</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleError("buggy/not-found")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Not found
        </button>
        <button
          onClick={() => handleError("buggy/bad-request")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Bad request
        </button>
        <button
          onClick={() => handleError("buggy/server-error")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Server error
        </button>
        <button
          onClick={() => handleError("buggy/unauthorised")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Unauthorised
        </button>
      </div>
      {validationErrors.length > 0 && (
        <div className="flex flex-col gap-2">
          {validationErrors.map((err, i) => (
            <div key={i} className="p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
              {err}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
