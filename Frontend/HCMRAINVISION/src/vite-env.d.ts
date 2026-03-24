/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __API_BASE_URL__?: string;
    __GOOGLE_MAPS_API_KEY__?: string;
  }
}

export {};
