import { useParams } from "react-router";
import { useProfile } from "../../lib/hooks/useProfile";
import ProfileCard from "./ProfileCard";

type Props = {
  activeTab: number;
};

export default function ProfileFollowings({ activeTab }: Props) {
  const { id } = useParams();
  const predicate = activeTab === 2 ? "followers" : "following";
  const { profile, followings, loadingFollowings } = useProfile(id, predicate);

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-700 mb-3">
        {activeTab === 2
          ? `People following ${profile?.displayName}`
          : `People ${profile?.displayName} is following`}
      </h3>
      <hr className="border-gray-200 mb-4" />
      {loadingFollowings ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {followings?.map((p) => (
            <ProfileCard key={p.id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
}
