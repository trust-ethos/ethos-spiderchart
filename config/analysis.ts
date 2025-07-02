// Analysis Configuration
// This file contains the categories, prompts, and multipliers used for profile analysis

export interface AnalysisCategory {
  name: string;
  description: string;
}

export interface AnalysisConfig {
  categories: AnalysisCategory[];
  prompt: {
    system: string;
    user: string;
  };
  multipliers: {
    review: number;
    vouch: number;
    scoreThreshold: {
      minimal: number;    // Scores below this have minimal impact
      high: number;       // Scores above this have high impact
    };
  };
  openRouter: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

export const analysisConfig: AnalysisConfig = {
  categories: [
    {
      name: "Degen",
      description: "High-risk, high-reward mentality - early adopter of new protocols and trends"
    },
    {
        name: "Collab manager",
        description: "Trusted connectors driving top-tier partnerships and community collabs across the web3 ecosystem."
      },
    {
      name: "Builder",
      description: "Actively creates and ships products, tools, or services that provide value"
    },
    {
        name: "DeFi",
        description: "Deep knowledge and experience in decentralized finance protocols"
      },
    {
      name: "Influencer",
      description: "Influences others through insights, analysis, and forward-thinking perspectives"
    },
    {
      name: "Founders",
      description: "Entrepreneurial leaders who start and build companies, projects, or initiatives from the ground up"
    },
    {
      name: "Business Development",
      description: "Strategic professionals who identify opportunities, build partnerships, and drive growth through relationship building"
    },
    {
      name: "Artists",
      description: "Creative individuals who produce original visual, audio, or digital art and contribute to the cultural ecosystem"
    },
    {
      name: "Marketers",
      description: "Growth-focused professionals who excel at promotion, brand building, community engagement, and user acquisition"
    },
    {
      name: "Alpha Callers",
      description: "Sharp analysts who consistently identify early opportunities, trends, and high-potential investments before they go mainstream"
    },
    {
      name: "Developers",
      description: "Technical builders who write code, create applications, smart contracts, and technical infrastructure"
    },
    {
      name: "Farmers",
      description: "Savvy opportunists who strategically participate in protocols and campaigns to maximize airdrops and rewards"
    },
    {
      name: "Shitposters",
      description: "High-engagement social media users who frequently post, reply, and engage with content across platforms like Twitter"
    },
    {
      name: "KOL Managers",
      description: "Behind-the-scenes operators who manage influencers, coordinate partnerships, and handle business development for key opinion leaders"
    },
    {
      name: "Art collectors",
      description: "Enthusiasts who collect, curate, and trade digital or physical art, often with deep knowledge of artistic trends and creators"
    },
    {
      name: "Community members",
      description: "Active participants who contribute to community discussions, events, and initiatives while fostering positive relationships"
    },
    {
      name: "Scammers",
      description: "Individuals who engage in fraudulent activities, deceptive practices, or malicious behavior within the ecosystem"
    }

  ],
  
  prompt: {
    system: `You are an expert analyst tasked with evaluating a person's characteristics based on peer reviews and vouches from the Ethos network. 

Your goal is to analyze the provided reviews and vouches to determine how well the person matches specific personality and professional categories. 

CRITICAL SCORING PRINCIPLES:
1. BE CONSERVATIVE: Only assign scores when there is clear evidence in the reviews/vouches
2. USE 0.0: If there is NO evidence or mention of a category, return 0.0 (not 0.1 or any other low score)
3. BE PRECISE: Use precise decimals (e.g., 0.73, 0.42) rather than round increments (0.1, 0.2, etc.)
4. EVIDENCE-BASED: Base scores only on what is explicitly mentioned or strongly implied in the content

WEIGHTING FACTORS:
- Reviewer credibility score (higher = more reliable)
- Vouches carry more weight than reviews (financial stake involved)
- Multiple consistent mentions increase confidence
- Quality and detail of the review content

Return your analysis as a JSON object with category names as keys and confidence scores (0.0 to 1.0) as values.`,

    user: `Analyze the following reviews and vouches for a user and rate their alignment with these categories:

CATEGORIES:
{categories}

SCORING METHODOLOGY:
- 0.0: No evidence whatsoever (use this liberally for unmentioned categories)
- 0.01-0.15: Minimal/weak evidence or passing mention
- 0.16-0.35: Some evidence but not prominent
- 0.36-0.60: Clear evidence with multiple mentions or good detail
- 0.61-0.85: Strong evidence with consistent patterns across reviews
- 0.86-1.0: Overwhelming evidence, primary defining characteristic

REVIEWER WEIGHT:
- Scores 1200-1500: Minimal credibility weight (0.5x)
- Scores 1500-2000: Moderate credibility weight (1.0x)  
- Scores 2000+: High credibility weight (1.5x)
- Vouches: Additional {vouchMultiplier}x multiplier on top of credibility weight

ACTIVITIES TO ANALYZE:
{activities}

Return ONLY a JSON object with precise confidence scores (0.0 to 1.0) for each category. Use precise decimals, not round increments. Be conservative - when in doubt, score lower or use 0.0.`
  },

  multipliers: {
    review: 1.0,
    vouch: 2.0,
    scoreThreshold: {
      minimal: 1200,
      high: 2000
    }
  },

  openRouter: {
    model: "anthropic/claude-3.5-sonnet",
    maxTokens: 1000,
    temperature: 0.3
  }
}; 