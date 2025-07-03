import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";
import DarkModeToggle from "../../islands/DarkModeToggle.tsx";
import ProfileAnalysisIsland from "../../islands/ProfileAnalysis.tsx";

interface ProfilePageProps {
  username: string;
}

export default function ProfilePage({ params }: PageProps<unknown, ProfilePageProps>) {
  const username = params.username;
  const ogImageUrl = `${Deno.env.get("DEPLOY_URL") || "http://localhost:8001"}/api/og-image?username=${encodeURIComponent(username)}`;
  const profileUrl = `${Deno.env.get("DEPLOY_URL") || "http://localhost:8001"}/profile/${encodeURIComponent(username)}`;

  return (
    <>
      <Head>
        <title>@{username} - Ethos Spider Graph</title>
        <meta name="description" content={`AI-powered analysis of @${username}'s Ethos profile showing alignment with web3 categories`} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`@${username} - Ethos Spider Graph`} />
        <meta property="og:description" content={`AI-powered analysis of @${username}'s Ethos profile showing alignment with web3 categories`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />
        <meta property="og:image:type" content="image/svg+xml" />
        <meta property="og:url" content={profileUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ethos Spider Graph" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`@${username} - Ethos Spider Graph`} />
        <meta name="twitter:description" content={`AI-powered analysis of @${username}'s Ethos profile showing alignment with web3 categories`} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content={`Spider graph analysis for @${username}`} />
        
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