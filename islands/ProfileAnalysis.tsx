import { useEffect, useRef, useState } from "preact/hooks";
import { Chart, registerables } from "chart.js";
import { EthosSearchResult, ProfileAnalysis } from "../types/ethos.ts";

// Register Chart.js components
Chart.register(...registerables);

interface ProfileAnalysisProps {
  username: string;
}

export default function ProfileAnalysisIsland({ username }: ProfileAnalysisProps) {
  const [user, setUser] = useState<EthosSearchResult | null>(null);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Find user by username and start analysis
  useEffect(() => {
    const findUserAndAnalyze = async () => {
      try {
        setLoading(true);
        
        // Search for the user by username
        const searchResponse = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: username
          })
        });

        if (!searchResponse.ok) {
          throw new Error('Failed to search for user');
        }

        const searchData = await searchResponse.json();
        
        // Find exact username match
        const foundUser = searchData.data.values.find((u: EthosSearchResult) => 
          u.username.toLowerCase() === username.toLowerCase()
        );

        if (!foundUser) {
          throw new Error(`User @${username} not found`);
        }

        setUser(foundUser);
        
        // Start analysis
        setAnalyzing(true);
        
        // Step 1: Fetch activities
        const activitiesResponse = await fetch('/api/activities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userkey: foundUser.userkey
          })
        });

        if (!activitiesResponse.ok) {
          const errorData = await activitiesResponse.json();
          throw new Error(errorData.error || 'Failed to fetch activities');
        }

        const activitiesData = await activitiesResponse.json();
        
        if (activitiesData.values.length === 0) {
          throw new Error('No reviews or vouches found for this user');
        }

        // Step 2: Analyze with LLM
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userkey: foundUser.userkey,
            activities: activitiesData.values
          })
        });

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json();
          throw new Error(errorData.error || 'Failed to analyze profile');
        }

        const analysisResult = await analysisResponse.json();
        setAnalysis(analysisResult);

      } catch (error) {
        console.error("Analysis failed:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(errorMessage);
      } finally {
        setLoading(false);
        setAnalyzing(false);
      }
    };

    findUserAndAnalyze();
  }, [username]);

  // Effect to create/update chart when analysis changes
  useEffect(() => {
    if (!analysis || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Filter out categories with 0 values for cleaner spider graph
    const filteredCategories = Object.keys(analysis.results).filter(category => analysis.results[category] > 0);
    const data = filteredCategories.map(category => Math.round(analysis.results[category] * 100));

    // Create new chart with dark mode colors
    chartInstance.current = new Chart(chartRef.current, {
      type: 'radar',
      data: {
        labels: filteredCategories,
        datasets: [{
          label: user?.name || 'Profile Analysis',
          data: data,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.2)', // indigo with opacity
          borderColor: 'rgb(99, 102, 241)', // indigo
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#1e293b', // slate-800
          pointHoverBackgroundColor: '#1e293b',
          pointHoverBorderColor: 'rgb(99, 102, 241)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 3
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true,
              color: '#475569' // slate-600
            },
            grid: {
              color: '#475569' // slate-600
            },
            suggestedMin: 0,
            suggestedMax: 100,
            pointLabels: {
              font: {
                size: 12
              },
              color: '#cbd5e1' // slate-300
            },
            ticks: {
              display: true,
              stepSize: 20,
              color: '#94a3b8', // slate-400
              backdropColor: 'transparent'
            }
          }
        },
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: '#cbd5e1' // slate-300
            }
          },
          tooltip: {
            backgroundColor: '#1e293b', // slate-800
            titleColor: '#f1f5f9', // slate-100
            bodyColor: '#cbd5e1', // slate-300
            borderColor: '#475569', // slate-600
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `${context.label}: ${context.raw}%`;
              }
            }
          }
        }
      }
    });

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [analysis, user?.name]);

  const renderSpiderGraph = () => {
    if (!analysis) return null;

    return (
      <div class="mb-6 p-4 theme-bg-secondary rounded-lg border theme-border">
        <h4 class="text-lg font-semibold mb-4 theme-text-primary">Profile Spider Graph</h4>
        <div style={{ height: '500px', position: 'relative' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  };

  const renderHighlights = () => {
    if (!analysis) return null;
    
    const categories = Object.keys(analysis.results);
    const sortedCategories = categories
      .filter(category => analysis.results[category] > 0)
      .sort((a, b) => analysis.results[b] - analysis.results[a])
      .slice(0, 3);
    
    if (sortedCategories.length === 0) return null;
    
    return (
      <div class="mb-6 p-4 theme-bg-surface rounded-lg border theme-border">
        <h4 class="text-lg font-semibold mb-4 theme-text-primary">🌟 Top Matches</h4>
        <div class="grid gap-3">
          {sortedCategories.map((category, index) => {
            const score = analysis.results[category];
            const percentage = Math.round(score * 100);
            const rankEmoji = ['🥇', '🥈', '🥉'][index];
            
            return (
              <div key={category} class="flex items-center justify-between p-3 theme-bg-secondary rounded-lg">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">{rankEmoji}</span>
                  <div>
                    <div class="font-medium theme-text-primary">{category}</div>
                    <div class="text-sm theme-text-secondary">Confidence: {score.toFixed(3)}</div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnalysisTable = () => {
    if (!analysis) return null;
    
    const categories = Object.keys(analysis.results);
    const sortedCategories = categories.sort((a, b) => analysis.results[b] - analysis.results[a]);
    
    return (
      <div class="mt-6 p-4 theme-bg-secondary rounded-lg border theme-border">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-semibold theme-text-primary">Analysis Results</h4>
          {analysis.model && (
            <span class="text-xs theme-text-muted bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
              Model: {analysis.model}
            </span>
          )}
        </div>
        
        {/* Summary Stats */}
        <div class="mb-6 p-3 theme-bg-surface rounded-lg border theme-border">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">{analysis.totalReviews}</div>
              <div class="text-sm theme-text-secondary">Reviews</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{analysis.totalVouches}</div>
              <div class="text-sm theme-text-secondary">Vouches</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">{analysis.avgAuthorScore}</div>
              <div class="text-sm theme-text-secondary">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div class="overflow-hidden rounded-lg border theme-border">
          <table class="min-w-full divide-y theme-border">
            <thead class="theme-bg-secondary">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                  Rank
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                  Confidence Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium theme-text-secondary uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody class="theme-bg-surface divide-y theme-border">
              {sortedCategories.map((category, index) => {
                const score = analysis.results[category];
                const percentage = Math.round(score * 100);
                const isHighScore = score >= 0.7;
                const isMediumScore = score >= 0.4 && score < 0.7;
                
                const isZeroScore = score === 0;
                
                return (
                  <tr key={category} class="theme-bg-surface">
                    <td class={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isZeroScore ? 'text-gray-400 dark:text-gray-500' : 'theme-text-primary'}`}>
                      #{index + 1}
                    </td>
                    <td class={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isZeroScore ? 'text-gray-400 dark:text-gray-500' : 'theme-text-primary'}`}>
                      {category}
                    </td>
                    <td class={`px-6 py-4 whitespace-nowrap text-sm font-mono ${isZeroScore ? 'text-gray-400 dark:text-gray-500' : 'theme-text-secondary'}`}>
                      {score.toFixed(3)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-1 mr-3">
                          <div class="flex items-center">
                            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isHighScore 
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : isMediumScore 
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white dark:text-black dark:border-gray-300'
                            }`}>
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* User Profile Header */
  useEffect(() => {
    if (user && typeof document !== 'undefined') {
      try {
        document.title = `${user.name} (@${user.username}) - Ethos Spider Graph`;
      } catch (e) {
        console.warn('Failed to update document title:', e);
      }
    }
  }, [user]);

  return (
    <div class="container mx-auto px-4 py-8">
      {/* Header */}
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-4">
          <a href="/" class="text-blue-600 hover:text-blue-800 mr-4">
            ← Back to Search
          </a>
          <h1 class="text-3xl font-bold theme-text-primary">
            Ethos Spider Graph
          </h1>
        </div>
        {user && (
          <div class="flex items-center justify-center space-x-4 mb-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              class="w-16 h-16 rounded-full border-2 border-gray-300"
            />
            <div class="text-left">
              <h2 class="text-2xl font-bold theme-text-primary">{user.name}</h2>
              <p class="text-lg theme-text-secondary">@{user.username}</p>
              <p class="text-sm theme-text-muted">Ethos Score: {user.score}</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="theme-text-secondary">Loading profile...</p>
        </div>
      )}

      {/* Analyzing State */}
      {analyzing && !loading && (
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="theme-text-secondary">Analyzing profile with AI...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div class="theme-bg-surface rounded-lg shadow-lg p-8 border theme-border">
          <div class="text-center">
            <div class="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 class="text-xl font-semibold theme-text-primary mb-2">Analysis Failed</h3>
            <p class="theme-text-secondary mb-4">{error}</p>
            <a 
              href="/"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Another Profile
            </a>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && user && (
        <div class="theme-bg-surface rounded-lg shadow-lg p-8 border theme-border">
          <div class="mb-6">
            <h3 class="text-xl font-semibold theme-text-primary mb-2">
              AI Analysis Results
            </h3>
            <p class="theme-text-secondary">
              Based on {analysis.totalReviews} reviews and {analysis.totalVouches} vouches
            </p>
          </div>

          {/* Share Button */}
          <div class="mb-6 text-center">
            <button 
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              class="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📋 Copy Share Link
            </button>
          </div>

          {renderHighlights()}
          {renderSpiderGraph()}
          {renderAnalysisTable()}
        </div>
      )}
    </div>
  );
} 