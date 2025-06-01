import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../lib/theme-context";
import { Button } from "./ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          {theme === "light" ? (
            <Sun size={20} className="text-amber-500" />
          ) : theme === "dark" ? (
            <Moon size={20} className="text-blue-400" />
          ) : (
            <Monitor size={20} />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
          <Sun size={16} className="text-amber-500" />
          <span>Light</span>
          {theme === "light" && <span className="ml-2 text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
          <Moon size={16} className="text-blue-400" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-2 text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
          <Monitor size={16} />
          <span>System</span>
          {theme === "system" && <span className="ml-2 text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 