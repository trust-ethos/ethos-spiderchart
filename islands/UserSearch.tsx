import { useState, useEffect, useRef } from "preact/hooks";
import { EthosSearchResult, EthosActivity, ProfileAnalysis } from "../types/ethos.ts";
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, RadarController } from "chart.js";

// Register Chart.js components
Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, RadarController);

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EthosSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EthosSearchResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justSelected, setJustSelected] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchUsers = async () => {
      // Skip search if user just selected someone
      if (justSelected) {
        return;
      }

      if (query.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=8`);
        const data = await response.json();
        
        if (data.ok && data.data) {
          setResults(data.data.values);
          // Only show dropdown if user hasn't just selected someone
          if (!justSelected) {
            setShowDropdown(true);
          }
        } else {
          setResults([]);
          setShowDropdown(false);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, justSelected]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user: EthosSearchResult) => {
    setJustSelected(true);
    setQuery(user.name || user.username);
    setShowDropdown(false);
    setSelectedUser(user);
    setAnalysis(null);
    setError(null);
    setResults([]); // Clear results to prevent dropdown from reopening
  };

  const handleInputBlur = () => {
    // Always close dropdown on blur after a delay to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleAnalyze = async () => {
    if (!selectedUser) return;

    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      console.log(`Starting analysis for user: ${selectedUser.userkey}`);
      
      // Step 1: Fetch activities
      const activitiesResponse = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userkey: selectedUser.userkey
        })
      });

      if (!activitiesResponse.ok) {
        const errorData = await activitiesResponse.json();
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      const activitiesData = await activitiesResponse.json();
      console.log(`Fetched ${activitiesData.values.length} activities`);
      
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
          userkey: selectedUser.userkey,
          activities: activitiesData.values
        })
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || 'Failed to analyze profile');
      }

      const analysisResult = await analysisResponse.json();
      console.log('Analysis completed:', analysisResult);
      setAnalysis(analysisResult);

         } catch (error) {
       console.error("Analysis failed:", error);
       const errorMessage = error instanceof Error ? error.message : String(error);
       setError(errorMessage);
     } finally {
      setAnalyzing(false);
    }
  };

  // Effect to create/update chart when analysis changes
  useEffect(() => {
    if (!analysis || !chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const categories = Object.keys(analysis.results);
    const data = categories.map(category => Math.round(analysis.results[category] * 100));

    // Create new chart with dark mode colors
    chartInstance.current = new Chart(chartRef.current, {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [{
          label: selectedUser?.name || 'Profile Analysis',
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
  }, [analysis, selectedUser?.name]);

  const renderSpiderGraph = () => {
    if (!analysis) return null;

    return (
      <div class="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h4 class="text-lg font-semibold mb-4 text-slate-100">Profile Spider Graph</h4>
        <div style={{ height: '500px', position: 'relative' }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  };

  const renderAnalysisTable = () => {
    if (!analysis) return null;
    
    const categories = Object.keys(analysis.results);
    const sortedCategories = categories.sort((a, b) => analysis.results[b] - analysis.results[a]);
    
    return (
      <div class="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <h4 class="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 transition-colors duration-300">Analysis Results</h4>
        
        {/* Summary Stats */}
        <div class="mb-6 p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-300">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{analysis.totalReviews}</div>
              <div class="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">Reviews</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">{analysis.totalVouches}</div>
              <div class="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">Vouches</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">{analysis.avgAuthorScore}</div>
              <div class="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-300">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-600">
            <thead class="bg-slate-100 dark:bg-slate-700 transition-colors duration-300">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300">
                  Rank
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300">
                  Confidence Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider transition-colors duration-300">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-600 transition-colors duration-300">
              {sortedCategories.map((category, index) => {
                const score = analysis.results[category];
                const percentage = Math.round(score * 100);
                const isHighScore = score >= 0.7;
                const isMediumScore = score >= 0.4 && score < 0.7;
                
                return (
                  <tr key={category} class={index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'}>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 transition-colors duration-300">
                      #{index + 1}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100 transition-colors duration-300">
                      {category}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-mono transition-colors duration-300">
                      {score.toFixed(3)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-1 mr-3">
                          <div class="flex items-center">
                            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-300 ${
                              isHighScore 
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                : isMediumScore 
                                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
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

        {/* Raw JSON for debugging */}
        <details class="mt-4">
          <summary class="cursor-pointer text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-300">
            Show Raw Analysis Results (for debugging)
          </summary>
          <pre class="mt-2 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs overflow-auto text-slate-700 dark:text-slate-300 transition-colors duration-300">
            {JSON.stringify(analysis.results, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div class="w-full">
      <div ref={searchContainerRef} class="relative w-full max-w-md mx-auto">
        <div class="relative">
          <input
            type="text"
            value={query}
            onInput={(e) => {
              const newQuery = (e.target as HTMLInputElement).value;
              setQuery(newQuery);
              // Reset justSelected when user starts typing after selection
              if (justSelected) {
                setJustSelected(false);
              }
            }}
            onFocus={() => {
              // Only show dropdown if we have results and user hasn't just selected
              if (results.length > 0 && !justSelected) {
                setShowDropdown(true);
              }
            }}
            onBlur={handleInputBlur}
            placeholder="Search Ethos users..."
            class="w-full px-4 py-3 pl-12 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500 dark:placeholder-slate-400 transition-colors duration-300"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg class="w-5 h-5 text-slate-500 dark:text-slate-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          {loading && (
            <div class="absolute inset-y-0 right-0 flex items-center pr-4">
              <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {showDropdown && results.length > 0 && (
          <div class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-96 overflow-y-auto transition-colors duration-300">
            {results.map((user) => (
              <div
                key={user.userkey}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur event
                  handleUserSelect(user);
                }}
                class="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-200 dark:border-slate-600 last:border-b-0 transition-colors duration-300"
              >
                <img
                  src={user.avatar || '/default-avatar.svg'}
                  alt={user.name || user.username}
                  class="w-10 h-10 rounded-full mr-3 bg-slate-200 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 transition-colors duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.svg';
                  }}
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate transition-colors duration-300">
                      {user.name || user.username}
                    </p>
                    {user.score > 0 && (
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors duration-300">
                        {user.score}
                      </span>
                    )}
                  </div>
                  {user.username && user.name && (
                    <p class="text-sm text-slate-600 dark:text-slate-300 truncate transition-colors duration-300">@{user.username}</p>
                  )}
                  {user.description && (
                    <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 transition-colors duration-300">
                      {user.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && results.length === 0 && !loading && query.length >= 2 && (
          <div class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg transition-colors duration-300">
            <div class="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 transition-colors duration-300">
              No users found for "{query}"
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div class="mt-8 p-6 bg-white dark:bg-slate-700 rounded-lg max-w-4xl mx-auto border border-slate-200 dark:border-slate-600 transition-colors duration-300">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 transition-colors duration-300">Selected User:</h3>
          <div class="flex items-center space-x-4 mb-6">
            <img
              src={selectedUser.avatar || '/default-avatar.svg'}
              alt={selectedUser.name || selectedUser.username}
              class="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 transition-colors duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h4 class="text-xl font-medium text-slate-900 dark:text-slate-100 transition-colors duration-300">
                  {selectedUser.name || selectedUser.username}
                </h4>
                {selectedUser.score > 0 && (
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors duration-300">
                    Score: {selectedUser.score}
                  </span>
                )}
              </div>
              {selectedUser.username && selectedUser.name && (
                <p class="text-slate-600 dark:text-slate-300 transition-colors duration-300">@{selectedUser.username}</p>
              )}
              {selectedUser.description && (
                <p class="text-slate-700 dark:text-slate-300 mt-2 transition-colors duration-300">{selectedUser.description}</p>
              )}
              {selectedUser.primaryAddress && (
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono transition-colors duration-300">
                  {selectedUser.primaryAddress}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center border border-indigo-500"
          >
            {analyzing ? (
              <>
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing Profile...
              </>
            ) : (
              'Analyze Profile & Generate Results'
            )}
          </button>

          {error && (
            <div class="mt-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-300">
              <p class="text-red-700 dark:text-red-300 text-sm transition-colors duration-300">{error}</p>
            </div>
          )}

          {analysis && (
            <>
              {renderSpiderGraph()}
              {renderAnalysisTable()}
            </>
          )}
        </div>
      )}
    </div>
  );
} 