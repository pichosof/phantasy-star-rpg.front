/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_UPLOAD_MAX_MB: string;
  readonly VITE_CLIENT_SECRET: string;
  readonly VITE_SIMULATE_PROD: string;
  readonly VITE_ASSETS_BUCKET: string;
  readonly VITE_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
