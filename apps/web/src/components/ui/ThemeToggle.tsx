"use client";

const STORAGE_KEY = "company-knowledge-theme";

function getPreferredTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }

  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const handleToggle = () => {
    const currentTheme =
      document.documentElement.dataset.theme === "light" ||
      document.documentElement.dataset.theme === "dark"
        ? (document.documentElement.dataset.theme as "light" | "dark")
        : (getPreferredTheme() as "light" | "dark");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <button type="button" className="theme-toggle" onClick={handleToggle} aria-label="Toggle theme">
      Appearance
    </button>
  );
}
