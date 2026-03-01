import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";

export default function ProfileHeader() {
  const { id } = useParams();
  const { profile } = useProfile(id);

  if (!profile) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex items-center gap-4 flex-1">
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.displayName}
              className="w-36 h-36 rounded-full object-cover"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-600">
              {profile.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-gray-800">{profile.displayName}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
