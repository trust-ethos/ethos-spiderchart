import { Head } from "$fresh/runtime.ts";
import UserSearch from "../islands/UserSearch.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Ethos Spider Graph - Profile Analysis</title>
        <meta name="description" content="Analyze Ethos profiles and visualize alignment with categories in a spider graph" />
      </Head>
      
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="container mx-auto px-4 py-12">
          {/* Header */}
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              Ethos Spider Graph
            </h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Analyze Ethos profiles and visualize how well users align with predetermined categories through AI-powered analysis of their reviews and vouches.
            </p>
          </div>

          {/* Search Section */}
          <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Search for an Ethos User
            </h2>
            
            <UserSearch />
          </div>

          {/* Features Preview */}
          <div class="grid md:grid-cols-3 gap-8 mb-12">
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Data Ingestion</h3>
              <p class="text-gray-600">
                Automatically collect and process all reviews and vouches from Ethos profiles
              </p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p class="text-gray-600">
                Leverage advanced LLMs via OpenRouter to analyze content and determine category alignment
              </p>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Spider Graph</h3>
              <p class="text-gray-600">
                Visualize alignment across multiple categories in an intuitive spider graph format
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 