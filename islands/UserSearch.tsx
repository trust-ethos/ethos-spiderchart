import { useState, useEffect, useRef } from "preact/hooks";
import { EthosSearchResult } from "../types/ethos.ts";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EthosSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EthosSearchResult | null>(null);
  const [justSelected, setJustSelected] = useState(false);
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
    setResults([]); // Clear results to prevent dropdown from reopening
  };

  const handleInputBlur = () => {
    // Always close dropdown on blur after a delay to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
    }, 150);
  };

  const handleAnalyze = () => {
    if (!selectedUser) return;
    
    // Navigate to the profile page
    window.location.href = `/profile/${selectedUser.username}`;
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
            class="w-full px-4 py-3 pl-12 theme-text-primary theme-bg-surface border theme-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-500"
          />
          <div class="absolute inset-y-0 left-0 flex items-center pl-4">
            <svg class="w-5 h-5 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="absolute z-10 w-full mt-1 theme-bg-surface border theme-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.map((user) => (
              <div
                key={user.userkey}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur event
                  handleUserSelect(user);
                }}
                class="flex items-center px-4 py-3 cursor-pointer border-b theme-border last:border-b-0 theme-hover-surface"
              >
                <img
                  src={user.avatar || '/default-avatar.svg'}
                  alt={user.name || user.username}
                  class="w-10 h-10 rounded-full mr-3 bg-slate-200 border theme-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.svg';
                  }}
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium theme-text-primary truncate">
                      {user.name || user.username}
                    </p>
                    {user.score > 0 && (
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {user.score}
                      </span>
                    )}
                  </div>
                  {user.username && user.name && (
                    <p class="text-sm theme-text-secondary truncate">@{user.username}</p>
                  )}
                  {user.description && (
                    <p class="text-xs theme-text-muted truncate mt-1">
                      {user.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && results.length === 0 && !loading && query.length >= 2 && (
          <div class="absolute z-10 w-full mt-1 theme-bg-surface border theme-border rounded-lg shadow-lg">
            <div class="px-4 py-3 text-sm theme-text-secondary">
              No users found for "{query}"
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div class="mt-8 p-6 theme-bg-surface rounded-lg max-w-4xl mx-auto border theme-border">
          <h3 class="text-lg font-semibold theme-text-primary mb-4">Selected User:</h3>
          <div class="flex items-center space-x-4 mb-6">
            <img
              src={selectedUser.avatar || '/default-avatar.svg'}
              alt={selectedUser.name || selectedUser.username}
              class="w-16 h-16 rounded-full bg-slate-200 border theme-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.svg';
              }}
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <h4 class="text-xl font-medium theme-text-primary">
                  {selectedUser.name || selectedUser.username}
                </h4>
                {selectedUser.score > 0 && (
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Score: {selectedUser.score}
                  </span>
                )}
              </div>
              {selectedUser.username && selectedUser.name && (
                <p class="theme-text-secondary">@{selectedUser.username}</p>
              )}
              {selectedUser.description && (
                <p class="theme-text-secondary mt-2">{selectedUser.description}</p>
              )}
              {selectedUser.primaryAddress && (
                <p class="text-xs theme-text-muted mt-2 font-mono">
                  {selectedUser.primaryAddress}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center border border-indigo-500"
          >
            <span>🔍 Analyze Profile</span>
          </button>
        </div>
      )}
    </div>
  );
} 