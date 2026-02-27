import { useState, useRef, useEffect } from "react";
import { useAccount } from "../../lib/hooks/useAccount";
import { Link } from "react-router";
import { User, LogOut } from "lucide-react";

export default function UserMenu() {
  const { currentUser, logoutUser } = useAccount();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/20 transition-colors text-white"
      >
        {currentUser?.imageUrl ? (
          <img
            src={currentUser.imageUrl}
            alt={currentUser.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-sm font-semibold">
            {currentUser?.displayName?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium">{currentUser?.displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded shadow-lg border border-gray-200 py-1 z-50">
          <Link
            to={`/profiles/${currentUser?.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User size={16} />
            My Profile
          </Link>
          <button
            onClick={() => { logoutUser.mutate(); setOpen(false); }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
