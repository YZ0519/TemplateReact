import { Users } from "lucide-react";
import { NavLink } from "react-router";
import { useStore } from "../../lib/hooks/useStore";
import { Observer } from "mobx-react-lite";
import { useAccount } from "../../lib/hooks/useAccount";
import UserMenu from "./UserMenu";

export default function NavBar() {
  const { uiStore } = useStore();
  const { currentUser } = useAccount();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#182a73] via-[#218aac] to-[#20a7ac] text-white shadow">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Users size={28} />
            <span className="text-xl font-bold">Template Demo</span>
            <Observer>
              {() =>
                uiStore.isLoading ? (
                  <span className="ml-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null
              }
            </Observer>
          </NavLink>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm font-medium hover:bg-white/20 transition-colors ${isActive ? "bg-white/20" : ""}`
              }
            >
              Projects
            </NavLink>
            <NavLink
              to="/errors"
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm font-medium hover:bg-white/20 transition-colors ${isActive ? "bg-white/20" : ""}`
              }
            >
              Errors
            </NavLink>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <UserMenu />
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="px-3 py-2 rounded text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-3 py-2 rounded text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
