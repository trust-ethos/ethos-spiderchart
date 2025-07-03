import { useState, useEffect } from "preact/hooks";

export default function DarkModeToggle() {
  // Get initial state from localStorage or default to true
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode !== null ? savedMode === 'true' : true;
    }
    return true;
  });

  // Apply dark mode class when component mounts or state changes
  useEffect(() => {
    const applyDarkMode = (dark: boolean) => {
      console.log('Applying dark mode:', dark); // Debug log
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      
      if (dark) {
        htmlElement.classList.add('dark');
        bodyElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
        bodyElement.classList.remove('dark');
      }
    };

    applyDarkMode(isDark);
    localStorage.setItem('darkMode', isDark.toString());
  }, [isDark]);

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