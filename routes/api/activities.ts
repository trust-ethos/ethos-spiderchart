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

      // Fetch ALL activities using pagination
      const activitiesUrl = `${ETHOS_API_BASE}/activities/profile/received`;
      let allActivities: any[] = [];
      let offset = 0;
      const batchSize = 500; // Try larger batches first
      
      while (true) {
        const activitiesPayload = {
          userkey: userkey,
          filter: ["review", "vouch"],
          excludeHistorical: false,
          orderBy: {
            field: "timestamp",
            direction: "desc"
          },
          limit: batchSize,
          offset: offset
        };

        console.log(`Making request to: ${activitiesUrl} (offset: ${offset}, limit: ${batchSize})`);

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
        console.log(`Received ${data.values.length} activities in batch ${Math.floor(offset / batchSize) + 1}`);
        
        // Add this batch to our collection
        allActivities.push(...data.values);
        
        // If we got less than the batch size, we're done
        if (data.values.length < batchSize) {
          break;
        }
        
        // Move to next batch
        offset += batchSize;
        
        // Safety limit to prevent infinite loops (max 10 batches = 5000 activities)
        if (offset >= 5000) {
          console.log(`Reached safety limit of 5000 activities`);
          break;
        }
      }

      console.log(`Total activities collected: ${allActivities.length}`);
      
      // Debug: Log the activity types we're seeing
      const activityTypes = allActivities.map((a: any) => a.type);
      console.log(`Activity types found:`, activityTypes);
      
      // Debug: Log the first activity structure to understand the schema
      if (allActivities.length > 0) {
        console.log(`First activity structure:`, JSON.stringify(allActivities[0], null, 2));
      }
      
      // Filter to only reviews and vouches
      const filteredActivities = allActivities.filter(
        (activity: any) => activity.type === 'review' || activity.type === 'vouch'
      );

      console.log(`Filtered to ${filteredActivities.length} reviews and vouches`);
      
      // If we still don't have any, let's try without filtering to see what we get
      if (filteredActivities.length === 0 && allActivities.length > 0) {
        console.log(`No reviews/vouches found, returning first 5 activities for debugging:`);
        console.log(JSON.stringify(allActivities.slice(0, 5), null, 2));
      }

      return new Response(
        JSON.stringify({
          values: filteredActivities,
          total: filteredActivities.length,
          limit: batchSize,
          offset: 0
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