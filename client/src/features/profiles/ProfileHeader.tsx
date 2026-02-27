import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";

export default function ProfileHeader() {
  const { id } = useParams();
  const { isCurrentUser, profile, updateFollowing } = useProfile(id);

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
            {profile.following && (
              <span className="px-3 py-1 text-sm border border-purple-500 text-purple-600 rounded-full w-fit">
                Following
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 min-w-40">
          <div className="flex gap-8 w-full justify-around">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Followers</p>
              <p className="text-3xl font-bold text-gray-800">{profile.followersCount ?? 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Following</p>
              <p className="text-3xl font-bold text-gray-800">{profile.followingCount ?? 0}</p>
            </div>
          </div>
          {!isCurrentUser && (
            <>
              <hr className="border-gray-200 w-full" />
              <button
                onClick={() => updateFollowing.mutate()}
                disabled={updateFollowing.isPending}
                className={`w-full py-2 px-4 rounded border font-medium transition-colors disabled:opacity-50
                  ${profile.following
                    ? "border-red-500 text-red-600 hover:bg-red-50"
                    : "border-green-500 text-green-600 hover:bg-green-50"
                  }`}
              >
                {profile.following ? "Unfollow" : "Follow"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
