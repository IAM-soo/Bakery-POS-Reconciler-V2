import { useEffect, useState } from "react";

import ReconciliationForm from "./components/ReconciliationForm";

function App() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:scheme-dark dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Bakery POS Reconciler V2</h1>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <span>ダークモード</span>
            <input
              className="peer sr-only"
              type="checkbox"
              role="switch"
              checked={isDark}
              onChange={(event) => setIsDark(event.target.checked)}
            />
            <span className="relative h-6 w-11 rounded-full bg-zinc-300 transition peer-checked:bg-emerald-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-600 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 dark:bg-zinc-700" />
          </label>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ReconciliationForm />
      </main>
    </div>
  );
}

export default App
