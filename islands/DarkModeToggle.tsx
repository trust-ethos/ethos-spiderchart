import { useState, useEffect } from "preact/hooks";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Check if there's a saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setIsDark(savedMode === 'true');
    }
    
    // Apply the mode to the document
    updateDarkMode(isDark);
  }, []);

  useEffect(() => {
    updateDarkMode(isDark);
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

  const updateDarkMode = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggleDarkMode}
      class={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${isDark 
          ? 'bg-indigo-600 focus:ring-offset-slate-800' 
          : 'bg-gray-200 focus:ring-offset-white'
        }
      `}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
    >
      <span
        class={`
          ${isDark ? 'translate-x-6' : 'translate-x-1'}
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
        `}
      />
      <span class="sr-only">Toggle dark mode</span>
    </button>
  );
} 