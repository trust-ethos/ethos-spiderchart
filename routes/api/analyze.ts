import { Handlers } from "$fresh/server.ts";
import { analysisConfig } from "../../config/analysis.ts";
import { EthosActivity, AnalysisResult, ProfileAnalysis } from "../../types/ethos.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { userkey, activities } = await req.json();
      
      if (!userkey || !activities || !Array.isArray(activities)) {
        return new Response(
          JSON.stringify({ error: "userkey and activities array are required" }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      if (!OPENROUTER_API_KEY) {
        console.error("OpenRouter API key not found in environment variables");
        console.error("Available env vars starting with 'OPEN':", Object.keys(Deno.env.toObject()).filter(k => k.startsWith('OPEN')));
        return new Response(
          JSON.stringify({ error: "OpenRouter API key not configured" }),
          { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      console.log(`Analyzing ${activities.length} activities for userkey: ${userkey}`);

      // Process activities for analysis
      const reviews = activities.filter((a: EthosActivity) => a.type === 'review');
      const vouches = activities.filter((a: EthosActivity) => a.type === 'vouch');
      
      console.log(`Found ${reviews.length} reviews and ${vouches.length} vouches`);

      if (activities.length === 0) {
        return new Response(
          JSON.stringify({ error: "No reviews or vouches found for analysis" }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // Format activities for LLM analysis
      const formattedActivities = activities.map((activity: EthosActivity) => {
        const type = activity.type;
        const authorScore = activity.author.score;
        const content = activity.data.comment || '';
        const score = activity.data.score || '';
        
        // Try to extract description from metadata if available
        let description = '';
        try {
          if (activity.data.metadata) {
            const metadata = JSON.parse(activity.data.metadata);
            description = metadata.description || '';
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
        
        return {
          type,
          authorScore,
          authorName: activity.author.name || activity.author.username || 'Anonymous',
          content,
          description,
          score,
          timestamp: activity.timestamp,
          llmQualityScore: activity.llmQualityScore
        };
      });

      // Calculate average author score
      const avgAuthorScore = activities.reduce((sum: number, activity: EthosActivity) => 
        sum + activity.author.score, 0) / activities.length;

      // Prepare categories for prompt
      const categoriesText = analysisConfig.categories
        .map(cat => `- ${cat.name}: ${cat.description}`)
        .join('\n');

      // Prepare user prompt
      const userPrompt = analysisConfig.prompt.user
        .replace('{categories}', categoriesText)
        .replace('{vouchMultiplier}', analysisConfig.multipliers.vouch.toString())
        .replace('{reviewMultiplier}', analysisConfig.multipliers.review.toString())
        .replace('{activities}', JSON.stringify(formattedActivities, null, 2));

      console.log(`Sending request to OpenRouter with model: ${analysisConfig.openRouter.model}`);

      // Call OpenRouter API
      const openRouterResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ethos-spidergraph.deno.dev', // Required by OpenRouter
          'X-Title': 'Ethos Spider Graph' // Optional but recommended
        },
        body: JSON.stringify({
          model: analysisConfig.openRouter.model,
          messages: [
            {
              role: 'system',
              content: analysisConfig.prompt.system
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: analysisConfig.openRouter.maxTokens,
          temperature: analysisConfig.openRouter.temperature
        })
      });

      if (!openRouterResponse.ok) {
        const errorText = await openRouterResponse.text();
        console.error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`);
        throw new Error(`OpenRouter API responded with status: ${openRouterResponse.status}`);
      }

      const openRouterData = await openRouterResponse.json();
      console.log(`OpenRouter response received`);
      
      // Extract the analysis result
      const analysisText = openRouterData.choices[0].message.content;
      console.log(`Analysis result: ${analysisText}`);
      
      let analysisResult: AnalysisResult;
      try {
        // Try to extract JSON from the response (handle cases where LLM adds extra text)
        let jsonString = analysisText.trim();
        
        // Look for JSON object boundaries
        const jsonStart = jsonString.indexOf('{');
        const jsonEnd = jsonString.lastIndexOf('}') + 1;
        
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          jsonString = jsonString.substring(jsonStart, jsonEnd);
        }
        
        analysisResult = JSON.parse(jsonString);
        console.log('Successfully parsed analysis result:', JSON.stringify(analysisResult, null, 2));
      } catch (parseError) {
        console.error(`Failed to parse analysis result: ${analysisText}`);
        console.error('Parse error:', parseError);
        throw new Error("Failed to parse LLM analysis result");
      }

      // Create profile analysis response
      const profileAnalysis: ProfileAnalysis = {
        userkey,
        timestamp: new Date().toISOString(),
        totalReviews: reviews.length,
        totalVouches: vouches.length,
        avgAuthorScore: Math.round(avgAuthorScore),
        results: analysisResult
      };

      return new Response(
        JSON.stringify(profileAnalysis),
        {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (error) {
      console.error("Error during profile analysis:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to analyze profile",
          details: errorMessage
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },
}; 