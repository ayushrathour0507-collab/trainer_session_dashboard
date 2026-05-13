/**
 * Purpose: Renders the compact 60px premium topbar with page title, notifications, theme, and user controls.
 */
import { Bell, LogIn, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import { useAuth } from "../hooks/useAuth.js";

const titleForPath = (pathname) => {
  if (pathname === "/") return "Home";
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part) => part.replace(/-/g, " ").replace(/^\w/, (char) => char.toUpperCase())).join(" / ");
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = titleForPath(location.pathname);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <header className="glass-chrome fixed left-0 right-0 top-0 z-30 flex h-[60px] items-center justify-between border-b px-4 md:left-16 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link to="/" className="min-w-0 md:min-w-[280px]">
          <p className="label-tag">BytesAndBeyond</p>
          <h1 className="truncate text-lg font-bold text-textPrimary">{pageTitle}</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="ghost-button h-10 w-10 min-h-10 p-0" aria-label="Notifications" onClick={() => toast("Notifications are shown in the dashboard panels.")}>
          <Bell className="h-5 w-5" />
        </button>
        <ThemeToggle />
        {user ? (
          <>
            <Link to={user.role === "admin" ? "/admin" : "/trainer/dashboard"} className="hidden items-center gap-2 rounded-pill px-2 py-1 hover:bg-accent/10 sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/10 text-sm font-black text-accent">{user.name?.[0] || "U"}</span>
              <span className="max-w-[150px] truncate text-sm font-bold">{user.name}</span>
            </Link>
            <button type="button" className="ghost-button h-10 w-10 min-h-10 p-0" onClick={handleLogout} aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </>
        ) : (
          <Link to="/login" className="primary-button px-3">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
