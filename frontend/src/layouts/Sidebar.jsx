/**
 * Purpose: Provides the 64px icon sidebar with role-aware navigation and hover tooltips.
 */
import { BarChart3, CalendarDays, ClipboardCheck, Home, MessageSquareText, Trophy, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import logoUrl from "../assets/logo.svg";

const publicLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/sessions", label: "Sessions", icon: CalendarDays },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const adminLinks = [
  { to: "/admin", label: "Admin Dashboard", icon: BarChart3 },
  { to: "/admin/sessions", label: "Manage Sessions", icon: ClipboardCheck },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
];

const trainerLinks = [
  { to: "/trainer/dashboard", label: "My Dashboard", icon: UserRound },
  { to: "/trainer/sessions", label: "My Sessions", icon: CalendarDays },
  { to: "/trainer/feedback", label: "My Feedback", icon: MessageSquareText },
];

const Sidebar = () => {
  const { user } = useAuth();
  const links = [...publicLinks, ...(user?.role === "admin" ? adminLinks : []), ...(user?.role === "trainer" ? trainerLinks : [])];

  return (
    <aside className="glass-chrome fixed bottom-0 left-0 z-40 flex h-[60px] w-full border-t md:top-0 md:h-screen md:w-16 md:flex-col md:border-r md:border-t-0">
      <NavLink to="/" className="hidden h-[60px] items-center justify-center border-b border-border md:flex" aria-label="BytesAndBeyond">
        <img src={logoUrl} alt="BytesAndBeyond" className="h-9 w-9 rounded-md" />
      </NavLink>
      <nav className="flex w-full items-center justify-around gap-1 px-2 md:flex-1 md:flex-col md:justify-start md:py-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={`${to}-${label}`}
            to={to}
            title={label}
            className={({ isActive }) => `group relative flex h-11 w-11 items-center justify-center rounded-md border-l-[3px] transition ${
              isActive ? "border-accent bg-accent/10 text-accent" : "border-transparent text-textSecondary hover:bg-accent/10 hover:text-accent"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="pointer-events-none absolute left-14 hidden whitespace-nowrap rounded-md bg-black px-2 py-1 text-xs font-bold text-white opacity-0 shadow-high transition group-hover:opacity-100 md:block">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
