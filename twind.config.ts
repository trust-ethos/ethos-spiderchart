import { Configuration } from "twind";

export default {
  selfURL: import.meta.url,
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        spin: 'spin 1s linear infinite',
      },
      colors: {
        dark: {
          bg: '#0f172a',      // slate-900
          surface: '#1e293b',  // slate-800  
          card: '#334155',     // slate-700
          border: '#475569',   // slate-600
          text: {
            primary: '#f1f5f9',   // slate-100
            secondary: '#cbd5e1', // slate-300
            muted: '#94a3b8',     // slate-400
          }
        }
      }
    },
  },
} as Configuration; 