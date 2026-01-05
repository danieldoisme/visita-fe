/**
 * API Client Setup
 * 
 * This file configures the generated SDK client to use our authenticated
 * axios instance (with auth interceptor and token refresh logic).
 * 
 * IMPORTANT: Import this file early in the app (e.g., in main.tsx or App.tsx)
 * to ensure the client is configured before any API calls are made.
 */

import { client } from "./generated/client.gen";
import { apiClient } from "./apiClient";

// Configure the generated SDK client to use our authenticated axios instance
client.setConfig({
    axios: apiClient,
});

export { client };
