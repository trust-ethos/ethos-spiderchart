// Ethos API Types based on the documentation

export interface EthosSearchResult {
  userkey: string;
  avatar: string;
  name: string;
  username: string;
  description: string;
  score: number;
  scoreXpMultiplier: number;
  profileId: number;
  primaryAddress: string;
}

export interface EthosSearchResponse {
  ok: boolean;
  data: {
    values: EthosSearchResult[];
    limit: number;
    offset: number;
    total: number;
  };
}

export interface EthosProfile {
  id: number;
  userkey: string;
  avatar: string;
  name: string;
  username: string;
  description: string;
  score: number;
  primaryAddress: string;
}

export interface EthosReview {
  id: string;
  subject: string;
  content: string;
  score: number;
  author: EthosProfile;
  createdAt: string;
}

export interface EthosVouch {
  id: string;
  subject: string;
  content: string;
  author: EthosProfile;
  createdAt: string;
}

// Ethos API v2 Activity Types - Based on actual API response structure
export interface EthosActivity {
  type: 'review' | 'vouch' | 'unvouch' | 'attestation' | 'slash' | 'vote' | 'project' | 'invitation-accepted' | 'open-slash' | 'closed-slash';
  data: {
    id: number;
    authorProfileId: number;
    author: string;
    subject: string;
    score: string;
    comment: string;
    metadata: string;
    createdAt: number;
    archived: boolean;
    attestationDetails?: {
      account: string;
      service: string;
    };
  };
  votes: {
    upvotes: number;
    downvotes: number;
  };
  replySummary: {
    count: number;
    participated: boolean;
  };
  timestamp: number;
  author: {
    userkey: string;
    avatar?: string;
    name?: string;
    username?: string;
    description?: string;
    score: number;
    scoreXpMultiplier: number;
    profileId: number;
    primaryAddress?: string;
  };
  subject: {
    userkey: string;
    avatar?: string;
    name?: string;
    username?: string;
    description?: string;
    score: number;
    scoreXpMultiplier: number;
    profileId: number;
    primaryAddress?: string;
  };
  events: Array<{
    id: number;
    blockIndex: number;
    blockNumber: number;
    contract: string;
    createdAt: number;
    processed: boolean;
    txHash: string;
    updatedAt: number;
  }>;
  llmQualityScore: number;
  translation?: {
    contentHash: string;
    detectedLanguage: string;
    translatedContent: string;
    translatedDescription: string;
  };
}

export interface EthosActivitiesResponse {
  values: EthosActivity[];
  total: number;
  limit: number;
  offset: number;
}

// Analysis Types
export interface AnalysisResult {
  [categoryName: string]: number; // Confidence score 0.0 to 1.0
}

export interface ProfileAnalysis {
  userkey: string;
  timestamp: string;
  totalReviews: number;
  totalVouches: number;
  avgAuthorScore: number;
  model: string;
  results: AnalysisResult;
} 