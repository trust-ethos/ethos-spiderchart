import { Handlers } from "$fresh/server.ts";
import { EthosSearchResponse } from "../../types/ethos.ts";

const ETHOS_API_BASE = "https://api.ethos.network/api/v1";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    const limit = url.searchParams.get("limit") || "10";
    const offset = url.searchParams.get("offset") || "0";

    if (!query || query.length < 2 || query.length > 100) {
      return new Response(
        JSON.stringify({ 
          error: "Query must be between 2 and 100 characters" 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    try {
      const searchUrl = `${ETHOS_API_BASE}/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Ethos API responded with status: ${response.status}`);
      }

      const data: EthosSearchResponse = await response.json();
      
      return new Response(
        JSON.stringify(data),
        {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    } catch (error) {
      console.error("Error fetching from Ethos API:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch data from Ethos API" 
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },

  async POST(req) {
    try {
      const body = await req.json();
      const { query, limit = "10", offset = "0" } = body;

      if (!query || query.length < 2 || query.length > 100) {
        return new Response(
          JSON.stringify({ 
            error: "Query must be between 2 and 100 characters" 
          }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      const searchUrl = `${ETHOS_API_BASE}/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Ethos API responded with status: ${response.status}`);
      }

      const data: EthosSearchResponse = await response.json();
      
      return new Response(
        JSON.stringify(data),
        {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    } catch (error) {
      console.error("Error fetching from Ethos API:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch data from Ethos API" 
        }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },
}; 