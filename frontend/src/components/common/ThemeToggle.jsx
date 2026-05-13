/**
 * Purpose: Toggles dark and light themes through the shared theme provider.
 */
import { Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext.jsx";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const changeTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    toggleTheme();
    toast.success(`${nextTheme === "dark" ? "Dark" : "Light"} mode enabled`);
  };

  return (
    <button type="button" className="ghost-button h-10 w-10 min-h-10 p-0" onClick={changeTheme} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle;
