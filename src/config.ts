interface Config {
  apiUrl: string;
  wsUrl: string;
  grafanaUrl?: string;
  isDevelopment: boolean;
}

// Extend Window interface to include _env_
declare global {
  interface Window {
    _env_?: {
      REACT_APP_ORCHESTRATOR_API_URL?: string;
      REACT_APP_WS_URL?: string;
      REACT_APP_GRAFANA_URL?: string;
    };
  }
}

function validateConfig(): Config {
  // Try window._env_ first (runtime config from Kubernetes ConfigMap)
  // Fall back to process.env (build-time config)
  const apiUrl = window._env_?.REACT_APP_ORCHESTRATOR_API_URL || process.env.REACT_APP_ORCHESTRATOR_API_URL;
  const wsUrl = window._env_?.REACT_APP_WS_URL || process.env.REACT_APP_WS_URL;
  const grafanaUrl = window._env_?.REACT_APP_GRAFANA_URL || process.env.REACT_APP_GRAFANA_URL;

  const defaultApiUrl = 'http://localhost:8080/api/v1';
  const defaultWsUrl = 'ws://localhost:8080/ws/dashboard';

  if (!apiUrl) {
    console.warn(
      'REACT_APP_ORCHESTRATOR_API_URL not set. Using default:', 
      defaultApiUrl
    );
  }

  if (!wsUrl) {
    console.warn(
      'REACT_APP_WS_URL not set. Using default:', 
      defaultWsUrl
    );
  }

  const finalApiUrl = apiUrl || defaultApiUrl;
  const finalWsUrl = wsUrl || defaultWsUrl;

  try {
    new URL(finalApiUrl);
  } catch (error) {
    throw new Error(
      `Invalid REACT_APP_ORCHESTRATOR_API_URL: "${finalApiUrl}". Must be a valid URL.`
    );
  }

  const wsProtocolRegex = /^wss?:\/\/.+/;
  if (!wsProtocolRegex.test(finalWsUrl)) {
    throw new Error(
      `Invalid REACT_APP_WS_URL: "${finalWsUrl}". Must start with ws:// or wss://`
    );
  }

  console.log('Configuration loaded:', {
    apiUrl: finalApiUrl,
    wsUrl: finalWsUrl,
    grafanaUrl: grafanaUrl || 'not configured',
    environment: process.env.NODE_ENV || 'development'
  });

  return {
    apiUrl: finalApiUrl,
    wsUrl: finalWsUrl,
    grafanaUrl: grafanaUrl,
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

export const config = validateConfig();

