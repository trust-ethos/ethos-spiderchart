import { Handlers } from "$fresh/server.ts";
import { EthosActivitiesResponse } from "../../types/ethos.ts";

const ETHOS_API_BASE = "https://api.ethos.network/api/v2";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { userkey } = await req.json();
      
      if (!userkey) {
        return new Response(
          JSON.stringify({ error: "userkey is required" }),
          { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      console.log(`Fetching activities for userkey: ${userkey}`);

      // Fetch activities where the user is the subject (received reviews/vouches)
      const activitiesUrl = `${ETHOS_API_BASE}/activities/profile/received`;
      const activitiesPayload = {
        userkey: userkey,
        filter: ["review", "vouch"],
        excludeHistorical: false,
        orderBy: {
          field: "timestamp",
          direction: "desc"
        },
        limit: 100,
        offset: 0
      };

      console.log(`Making request to: ${activitiesUrl}`);
      console.log(`Payload:`, JSON.stringify(activitiesPayload, null, 2));

      const response = await fetch(activitiesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        body: JSON.stringify(activitiesPayload)
      });

      if (!response.ok) {
        console.error(`Ethos API responded with status: ${response.status}`);
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Ethos API responded with status: ${response.status}`);
      }

      const data: EthosActivitiesResponse = await response.json();
      console.log(`Received ${data.values.length} activities`);
      
      // Debug: Log the activity types we're seeing
      const activityTypes = data.values.map(a => a.type);
      console.log(`Activity types found:`, activityTypes);
      
      // Debug: Log the first activity structure to understand the schema
      if (data.values.length > 0) {
        console.log(`First activity structure:`, JSON.stringify(data.values[0], null, 2));
      }
      
      // Filter to only reviews and vouches
      const filteredActivities = data.values.filter(
        activity => activity.type === 'review' || activity.type === 'vouch'
      );

      console.log(`Filtered to ${filteredActivities.length} reviews and vouches`);
      
      // If we still don't have any, let's try without filtering to see what we get
      if (filteredActivities.length === 0 && data.values.length > 0) {
        console.log(`No reviews/vouches found, returning first 5 activities for debugging:`);
        console.log(JSON.stringify(data.values.slice(0, 5), null, 2));
      }

      return new Response(
        JSON.stringify({
          values: filteredActivities,
          total: filteredActivities.length,
          limit: data.limit,
          offset: data.offset
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );

    } catch (error) {
      console.error("Error fetching activities from Ethos API:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch activities from Ethos API",
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