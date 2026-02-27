import type { ReactNode } from "react";
import { NavLink } from "react-router";

export default function MenuItemLink({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded text-sm font-bold uppercase tracking-wide transition-colors hover:bg-white/20
        ${isActive ? "text-yellow-300" : "text-white"}`
      }
    >
      {children}
    </NavLink>
  );
}
