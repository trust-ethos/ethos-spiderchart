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

Your goal is to analyze the provided reviews and vouches to determine how well the person matches specific personality and professional categories. Consider:

1. The content and sentiment of reviews/vouches
2. The credibility score of the reviewer (higher scores = more reliable)
3. Vouches carry more weight than reviews as they involve financial stake
4. Look for patterns and consistent themes across multiple reviews

Return your analysis as a JSON object with category names as keys and confidence scores (0.0 to 1.0) as values.`,

    user: `Analyze the following reviews and vouches for a user and rate their alignment with these categories:

CATEGORIES:
{categories}

SCORING GUIDELINES:
- Reviews from users with scores 1200-1500: Minimal weight
- Reviews from users with scores 1500-2000: Moderate weight  
- Reviews from users with scores 2000+: High weight
- Vouches should be weighted {vouchMultiplier}x more than reviews
- Reviews should be weighted {reviewMultiplier}x base weight

REVIEWS AND VOUCHES:
{activities}

Please respond with a JSON object containing confidence scores (0.0 to 1.0) for each category. Only return the JSON, no additional text.`
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