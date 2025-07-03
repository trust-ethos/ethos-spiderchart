import { Handlers } from "$fresh/server.ts";

// Simple SVG-based spider graph generator
function generateSpiderGraphSVG(
  username: string,
  name: string,
  data: Record<string, number>,
  avatar?: string
): string {
  // Filter categories with scores > 0 and get top 8
  const categories = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 8);
    
  if (categories.length === 0) {
    return generateFallbackSVG(username, name, avatar);
  }

  const centerX = 400;
  const centerY = 300;
  const maxRadius = 120;
  const numCategories = categories.length;
  
  // Generate points for the spider graph
  let pathData = "";
  const points: Array<{x: number, y: number, label: string, value: number}> = [];
  
  categories.forEach(([category, value], index) => {
    const angle = (index * 2 * Math.PI) / numCategories - Math.PI / 2;
    const radius = (value * maxRadius);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    points.push({x, y, label: category, value});
    
    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
  });
  pathData += " Z";
  
  // Generate grid circles
  const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(factor => 
    `<circle cx="${centerX}" cy="${centerY}" r="${maxRadius * factor}" fill="none" stroke="#374151" stroke-width="1" opacity="0.3"/>`
  ).join("");
  
  // Generate axis lines
  const axisLines = categories.map((_, index) => {
    const angle = (index * 2 * Math.PI) / numCategories - Math.PI / 2;
    const x2 = centerX + Math.cos(angle) * maxRadius;
    const y2 = centerY + Math.sin(angle) * maxRadius;
    return `<line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke="#374151" stroke-width="1" opacity="0.3"/>`;
  }).join("");
  
  // Generate category labels
  const labels = categories.map(([category, value], index) => {
    const angle = (index * 2 * Math.PI) / numCategories - Math.PI / 2;
    const labelRadius = maxRadius + 25;
    const x = centerX + Math.cos(angle) * labelRadius;
    const y = centerY + Math.sin(angle) * labelRadius;
    
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="11" font-weight="500">${category}</text>`;
  }).join("");

  return `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E293B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0F172A;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="spider" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366F1;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:0.6" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="800" height="600" fill="url(#bg)"/>
      
      <!-- Title -->
      <text x="400" y="60" text-anchor="middle" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="32" font-weight="700">Ethos Spider Graph</text>
      
      <!-- User info -->
      <text x="400" y="100" text-anchor="middle" fill="#CBD5E1" font-family="Inter, sans-serif" font-size="20" font-weight="600">${name}</text>
      <text x="400" y="125" text-anchor="middle" fill="#94A3B8" font-family="Inter, sans-serif" font-size="16">@${username}</text>
      
      <!-- Grid -->
      ${gridCircles}
      ${axisLines}
      
      <!-- Spider graph -->
      <path d="${pathData}" fill="url(#spider)" stroke="#6366F1" stroke-width="2"/>
      
      <!-- Data points -->
      ${points.map(point => 
        `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#6366F1" stroke="#1E293B" stroke-width="2"/>`
      ).join("")}
      
      <!-- Labels -->
      ${labels}
      
      <!-- Footer -->
      <text x="400" y="550" text-anchor="middle" fill="#64748B" font-family="Inter, sans-serif" font-size="14">AI-powered profile analysis • ethos-spidergraph.vercel.app</text>
    </svg>
  `;
}

function generateFallbackSVG(username: string, name: string, avatar?: string): string {
  return `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1E293B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0F172A;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="800" height="600" fill="url(#bg)"/>
      
      <!-- Title -->
      <text x="400" y="200" text-anchor="middle" fill="#F1F5F9" font-family="Inter, sans-serif" font-size="32" font-weight="700">Ethos Spider Graph</text>
      
      <!-- User info -->
      <text x="400" y="280" text-anchor="middle" fill="#CBD5E1" font-family="Inter, sans-serif" font-size="24" font-weight="600">${name}</text>
      <text x="400" y="320" text-anchor="middle" fill="#94A3B8" font-family="Inter, sans-serif" font-size="18">@${username}</text>
      
      <!-- Message -->
      <text x="400" y="380" text-anchor="middle" fill="#64748B" font-family="Inter, sans-serif" font-size="16">Profile analysis coming soon...</text>
      
      <!-- Footer -->
      <text x="400" y="500" text-anchor="middle" fill="#64748B" font-family="Inter, sans-serif" font-size="14">AI-powered profile analysis • ethos-spidergraph.vercel.app</text>
    </svg>
  `;
}

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");
    
    if (!username) {
      return new Response("Username parameter required", { status: 400 });
    }

    try {
      // Try to get analysis from cache first
      const kv = await Deno.openKv();
      const cachedResult = await kv.get(["analysis_cache", `service:x.com:${username}`]);
      
      let analysisData: any = null;
      let userData = { name: username, username };
      
      if (cachedResult.value) {
        analysisData = cachedResult.value as any;
        userData = { name: (analysisData as any).name || username, username };
      } else {
        // Try to search for the user
        try {
          const searchResponse = await fetch(`${req.url.split('/api/og-image')[0]}/api/search?query=${encodeURIComponent(username)}&limit=1`);
          const searchData = await searchResponse.json();
          
          if (searchData.ok && searchData.data && searchData.data.values.length > 0) {
            const user = searchData.data.values[0];
            userData = { name: user.name || user.username, username: user.username };
          }
        } catch (error) {
          console.error("Failed to search for user:", error);
        }
      }
      
      // Generate SVG
      const svg = analysisData 
        ? generateSpiderGraphSVG(userData.username, userData.name, (analysisData as any).results)
        : generateFallbackSVG(userData.username, userData.name);

      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      });
    } catch (error) {
      console.error("Error generating OG image:", error);
      
      // Return fallback SVG
      const fallbackSvg = generateFallbackSVG(username, username);
      return new Response(fallbackSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes on error
        },
      });
    }
  },
}; 