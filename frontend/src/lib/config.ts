import { createServerFn } from "@tanstack/react-start";

export interface RuntimeConfig {
  apiUrl: string;
  auth0Domain: string;
  auth0ClientId: string;
}

export const getRuntimeConfig = createServerFn({ method: "GET" }).handler(
  (): RuntimeConfig => {
    return {
      apiUrl: process.env.API_URL || "http://localhost:8000",
      auth0Domain: process.env.AUTH0_DOMAIN || "",
      auth0ClientId: process.env.AUTH0_CLIENT_ID || "",
    };
  }
);

let cachedConfig: RuntimeConfig | null = null;
let configPromise: Promise<RuntimeConfig> | null = null;

export async function getConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = getRuntimeConfig().then((config) => {
    cachedConfig = config;
    return config;
  });

  return configPromise;
}

export function getConfigSync(): RuntimeConfig | null {
  return cachedConfig;
}

export function setConfig(config: RuntimeConfig): void {
  cachedConfig = config;
}
