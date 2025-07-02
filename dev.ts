#!/usr/bin/env -S deno run -A --watch=static/,routes/

import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

// Load environment variables from .env file
await load({ export: true });

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

await dev(import.meta.url, "./main.ts", config); 