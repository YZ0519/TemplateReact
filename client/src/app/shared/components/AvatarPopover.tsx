import { useState, useRef } from "react";
import { Link } from "react-router";
import ProfileCard from "../../../features/profiles/ProfileCard";
import type { Profile } from "../../../lib/types";

type Props = {
  profile: Profile;
};

export default function AvatarPopover({ profile }: Props) {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    timer.current = setTimeout(() => setShow(true), 200);
  };

  const handleLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link to={`/profiles/${profile.id}`}>
        {profile.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={profile.displayName}
            className={`w-10 h-10 rounded-full object-cover ${profile.following ? "ring-2 ring-purple-500" : ""}`}
          />
        ) : (
          <div className={`w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600 ${profile.following ? "ring-2 ring-purple-500" : ""}`}>
            {profile.displayName?.[0]?.toUpperCase()}
          </div>
        )}
      </Link>
      {show && (
        <div className="absolute left-0 top-full mt-1 z-50 pointer-events-none">
          <ProfileCard profile={profile} />
        </div>
      )}
    </div>
  );
}
