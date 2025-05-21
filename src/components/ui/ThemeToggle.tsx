
import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [theme, setThemeState] = React.useState<"light" | "dark" | "system">("system");

  React.useEffect(() => {
    // Get the theme from localStorage or default to system
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "system";
    setThemeState(savedTheme);
  }, []);

  React.useEffect(() => {
    // Handle system preference changes
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", event.matches);
      }
    };

    // Apply theme based on selection
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      
      // Add listener for system preference changes
      window.matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", handleSystemThemeChange);
    } else {
      const isDark = theme === "dark";
      document.documentElement.classList.toggle("dark", isDark);
    }

    localStorage.setItem("theme", theme);

    // Cleanup
    return () => {
      window.matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleSystemThemeChange);
    };
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemeState("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
