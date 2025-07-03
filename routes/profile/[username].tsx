import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import DarkModeToggle from "../../islands/DarkModeToggle.tsx";
import ProfileAnalysisIsland from "../../islands/ProfileAnalysis.tsx";

interface ProfilePageProps {
  username: string;
}

export default function ProfilePage({ params }: PageProps<unknown, ProfilePageProps>) {
  const username = params.username;

  return (
    <>
      <Head>
        <title>@{username} - Ethos Spider Graph</title>
        <meta name="description" content={`AI-powered analysis of @${username}'s Ethos profile showing alignment with web3 categories`} />
        <link rel="stylesheet" href="/darkmode.css" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Apply dark mode immediately to prevent flash
            (function() {
              try {
                const savedMode = localStorage.getItem('darkMode');
                const prefersDark = savedMode !== null ? savedMode === 'true' : true;
                if (prefersDark && document.documentElement && document.body) {
                  document.documentElement.classList.add('dark');
                  document.body.classList.add('dark');
                }
              } catch (e) {
                console.warn('Dark mode initialization failed:', e);
              }
            })();
          `
        }} />
      </Head>
      
      <div class="min-h-screen bg-gradient-to-br theme-bg-primary">
        {/* Dark Mode Toggle */}
        <div class="absolute top-4 right-4 z-50">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium theme-text-secondary">
              Dark Mode
            </span>
            <DarkModeToggle />
          </div>
        </div>

        {/* Profile Analysis Island */}
        <ProfileAnalysisIsland username={username} />
      </div>
    </>
  );
} 