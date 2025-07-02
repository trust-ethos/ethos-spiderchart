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

  useEffect(() => {
    const searchUsers = async () => {
      // Skip search if user just selected someone
      if (justSelected) {
        setJustSelected(false);
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
          setShowDropdown(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, justSelected]);

  const handleUserSelect = (user: EthosSearchResult) => {
    setJustSelected(true);
    setQuery(user.name || user.username);
    setShowDropdown(false);
    setSelectedUser(user);
    setAnalysis(null);
    setError(null);
  };

  const handleInputBlur = () => {
    // Don't hide dropdown if user just selected someone
    if (justSelected) {
      return;
    }
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      if (!justSelected) {
        setShowDropdown(false);
      }
    }, 200);
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

    // Create new chart
    chartInstance.current = new Chart(chartRef.current, {
      type: 'radar',
      data: {
        labels: categories,
        datasets: [{
          label: selectedUser?.name || 'Profile Analysis',
          data: data,
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(54, 162, 235)',
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
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100,
            pointLabels: {
              font: {
                size: 12
              }
            },
            ticks: {
              display: true,
              stepSize: 20
            }
          }
        },
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
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
      <div class="mb-6 p-4 bg-white rounded-lg border">
        <h4 class="text-lg font-semibold mb-4">Profile Spider Graph</h4>
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
      <div class="mt-6 p-4 bg-white rounded-lg border">
        <h4 class="text-lg font-semibold mb-4">Analysis Results</h4>
        
        {/* Summary Stats */}
        <div class="mb-6 p-3 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-600">{analysis.totalReviews}</div>
              <div class="text-sm text-gray-600">Reviews</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{analysis.totalVouches}</div>
              <div class="text-sm text-gray-600">Vouches</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600">{analysis.avgAuthorScore}</div>
              <div class="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div class="overflow-hidden rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {sortedCategories.map((category, index) => {
                const score = analysis.results[category];
                const percentage = Math.round(score * 100);
                const isHighScore = score >= 0.7;
                const isMediumScore = score >= 0.4 && score < 0.7;
                
                return (
                  <tr key={category} class={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {score.toFixed(3)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-1 mr-3">
                          <div class="flex items-center">
                            <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isHighScore 
                                ? 'bg-green-100 text-green-800'
                                : isMediumScore 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
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
          <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
            Show Raw Analysis Results (for debugging)
          </summary>
          <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(analysis.results, null, 2)}
          </pre>
        </details>
      </div>
    );
  };

  return (
    <div class="w-full">
      <div class="relative w-full max-w-md mx-auto">
        <div class="relative">
          <input
            type="text"
            value={query}
            onInput={(e) => {
              const newQuery = (e.target as HTMLInputElement).value;
              setQuery(newQuery);
              // Reset justSelected when user starts typing again
              if (justSelected && newQuery !== (selectedUser?.name || selectedUser?.username || '')) {
                setJustSelected(false);
              }
            }}
            onFocus={() => {
              if (!justSelected && query.length >= 2) {
                setShowDropdown(true);
              }
            }}
            onBlur={handleInputBlur}
            placeholder="Search Ethos users..."
            class="w-full px-4 py-3 pl-12 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          {loading && (
            <div class="absolute inset-y-0 right-0 flex items-center pr-4">
              <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {showDropdown && results.length > 0 && (
          <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.map((user) => (
              <div
                key={user.userkey}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur event
                  handleUserSelect(user);
                }}
                class="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <img
                  src={user.avatar || '/default-avatar.svg'}
                  alt={user.name || user.username}
                  class="w-10 h-10 rounded-full mr-3 bg-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.svg';
                  }}
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {user.name || user.username}
                    </p>
                    {user.score > 0 && (
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {user.score}
                      </span>
                    )}
                  </div>
                  {user.username && user.name && (
                    <p class="text-sm text-gray-500 truncate">@{user.username}</p>
                  )}
                  {user.description && (
                    <p class="text-xs text-gray-400 truncate mt-1">
                      {user.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && results.length === 0 && !loading && query.length >= 2 && (
          <div class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div class="px-4 py-3 text-sm text-gray-500">
              No users found for "{query}"
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div class="mt-8 p-6 bg-gray-50 rounded-lg max-w-4xl mx-auto">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Selected User:</h3>
          <div class="flex items-center space-x-4 mb-6">
            <img
              src={selectedUser.avatar || '/default-avatar.svg'}
              alt={selectedUser.name || selectedUser.username}
              class="w-16 h-16 rounded-full bg-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h4 class="text-xl font-medium text-gray-900">
                  {selectedUser.name || selectedUser.username}
                </h4>
                {selectedUser.score > 0 && (
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Score: {selectedUser.score}
                  </span>
                )}
              </div>
              {selectedUser.username && selectedUser.name && (
                <p class="text-gray-600">@{selectedUser.username}</p>
              )}
              {selectedUser.description && (
                <p class="text-gray-500 mt-2">{selectedUser.description}</p>
              )}
              {selectedUser.primaryAddress && (
                <p class="text-xs text-gray-400 mt-2 font-mono">
                  {selectedUser.primaryAddress}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
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
            <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800 text-sm">{error}</p>
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