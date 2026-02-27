import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import TextInput from "../../app/shared/components/TextInput";
import {
  editProfileSchema,
  type EditProfileSchema,
} from "../../lib/schemas/editProfileSchema";

type Props = {
  setEditMode: (editMode: boolean) => void;
};

export default function ProfileEdit({ setEditMode }: Props) {
  const { id } = useParams();
  const { updateProfile, profile } = useProfile(id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: EditProfileSchema) => {
    updateProfile.mutate(data, {
      onSuccess: () => setEditMode(false),
    });
  };

  useEffect(() => {
    reset({
      displayName: profile?.displayName,
      bio: profile?.bio || "",
    });
  }, [profile, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-3">
      <TextInput label="Display Name" name="displayName" control={control} />
      <TextInput label="Add your bio" name="bio" control={control} multiline rows={4} />
      <button
        type="submit"
        disabled={!isValid || !isDirty || updateProfile.isPending}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Update profile
      </button>
    </form>
  );
}
