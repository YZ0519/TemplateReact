import { Link } from "react-router";
import { UserRound } from "lucide-react";
import type { Profile } from "../../lib/types";

type Props = {
  profile: Profile;
};

export default function ProfileCard({ profile }: Props) {
  return (
    <Link to={`/profiles/${profile.id}`} className="no-underline">
      <div className="bg-white shadow rounded-xl p-4 w-52 hover:shadow-md transition-shadow">
        {profile.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={profile.displayName}
            className="w-full h-36 object-cover rounded-lg mb-3"
          />
        ) : (
          <div className="w-full h-36 rounded-lg mb-3 bg-gray-200 flex items-center justify-center">
            <UserRound size={48} className="text-gray-400" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-gray-800">{profile.displayName}</h3>
          {profile.bio && (
            <p className="text-xs text-gray-500 truncate">{profile.bio}</p>
          )}
          {profile.following && (
            <span className="text-xs border border-purple-400 text-purple-600 rounded-full px-2 py-0.5 w-fit">
              Following
            </span>
          )}
        </div>
        <hr className="border-gray-200 my-2" />
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <UserRound size={14} />
          <span>{profile.followersCount ?? 0} Followers</span>
        </div>
      </div>
    </Link>
  );
}
