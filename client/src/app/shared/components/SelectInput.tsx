import {
  useController,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";

type Props<T extends FieldValues> = UseControllerProps<T> & {
  items: { text: string; value: string }[];
  label: string;
};

export default function SelectInput<T extends FieldValues>(props: Props<T>) {
  const { field, fieldState } = useController({ ...props });

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{props.label}</label>
      <select
        {...field}
        value={field.value ?? ""}
        className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white
          ${fieldState.error ? "border-red-500" : "border-gray-300"}`}
      >
        <option value="">Select {props.label}</option>
        {props.items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.text}
          </option>
        ))}
      </select>
      {fieldState.error && (
        <p className="text-xs text-red-600">{fieldState.error.message}</p>
      )}
    </div>
  );
}
