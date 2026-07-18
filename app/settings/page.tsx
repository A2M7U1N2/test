"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { signOut } from "@/actions/auth";
import { ChevronLeft, Sun, Moon, Globe, LogOut, User } from "lucide-react";

type Language = "en" | "ar";

const LANG_STORAGE_KEY = "studyos-language";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    if (saved) setLanguage(saved);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  return (
    <main className="max-w-2xl mx-auto p-5 pb-24 w-full">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/")}
          className="p-2 bg-card border border-border rounded-full text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="space-y-3">
        {/* Profile Link */}
        <button
          onClick={() => router.push("/profile")}
          className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-left"
        >
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Student Profile</p>
            <p className="text-sm text-muted-foreground">University, faculty, and year</p>
          </div>
        </button>
        {/* Theme */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-foreground">Appearance</p>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Dark Mode" : "Light Mode"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative overflow-hidden ${
                theme === "dark" ? "bg-red-600" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <p className="font-medium text-foreground">Language</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === "en"
                  ? "bg-red-600 text-white"
                  : "bg-background border border-border text-muted-foreground"
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange("ar")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === "ar"
                  ? "bg-red-600 text-white"
                  : "bg-background border border-border text-muted-foreground"
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-4 text-red-500"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </form>
      </div>
    </main>
  );
}