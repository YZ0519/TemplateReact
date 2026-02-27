import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type Props<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
};

export default function TextInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });

  return (
    <div className="flex flex-col gap-1">
      {props.label && (
        <label className="text-sm font-medium text-gray-700">{props.label}</label>
      )}
      {props.multiline ? (
        <textarea
          {...field}
          value={field.value ?? ""}
          rows={props.rows ?? 4}
          placeholder={props.placeholder}
          className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y
            ${fieldState.error ? "border-red-500" : "border-gray-300"}`}
        />
      ) : (
        <input
          {...field}
          value={field.value ?? ""}
          type={props.type ?? "text"}
          placeholder={props.placeholder}
          className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500
            ${fieldState.error ? "border-red-500" : "border-gray-300"}`}
        />
      )}
      {fieldState.error && (
        <p className="text-xs text-red-600">{fieldState.error.message}</p>
      )}
    </div>
  );
}
