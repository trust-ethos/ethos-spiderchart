export default function DarkModeTest() {
  return (
    <div class="p-4 m-4 border-2 theme-border theme-bg-surface rounded">
      <h3 class="text-lg font-bold theme-text-primary mb-2">Dark Mode Test</h3>
      <p class="theme-text-secondary mb-2">This should change color when dark mode is toggled.</p>
      <div class="p-2 theme-bg-primary rounded">
        <span class="theme-text-primary">Primary background with primary text</span>
      </div>
      <div class="p-2 theme-bg-secondary rounded mt-2">
        <span class="theme-text-secondary">Secondary background with secondary text</span>
      </div>
    </div>
  );
} 