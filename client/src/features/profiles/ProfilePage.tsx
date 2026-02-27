import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";
import { useProfile } from "../../lib/hooks/useProfile";
import { useParams } from "react-router";

export default function ProfilePage() {
  const { id } = useParams();
  const { profile, loadingProfile } = useProfile(id);

  if (loadingProfile) return <p className="p-4 text-gray-500">Loading profile...</p>;
  if (!profile) return <p className="p-4 text-gray-500">Profile not found</p>;

  return (
    <div>
      <ProfileHeader />
      <ProfileContent />
    </div>
  );
}
