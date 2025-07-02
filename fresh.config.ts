import { defineConfig } from "$fresh/server.ts";
import twind from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

export default defineConfig({
  plugins: [twind(twindConfig)],
}); 