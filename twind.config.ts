import { Configuration } from "twind";

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      animation: {
        spin: 'spin 1s linear infinite',
      },
    },
  },
} as Configuration; 