import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import { useState } from "react";
import ProfileEdit from "./ProfileEdit";

export default function ProfileAbout() {
  const { id } = useParams();
  const { profile, isCurrentUser } = useProfile(id);
  const [editMode, setEditMode] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-700">About {profile?.displayName}</h3>
        {isCurrentUser && (
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-sm text-blue-600 hover:underline"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        )}
      </div>
      <hr className="border-gray-200 my-3" />
      {editMode ? (
        <ProfileEdit setEditMode={setEditMode} />
      ) : (
        <div className="overflow-auto max-h-80">
          <p className="text-gray-600 whitespace-pre-wrap">
            {profile?.bio || "No description added yet"}
          </p>
        </div>
      )}
    </div>
  );
}
