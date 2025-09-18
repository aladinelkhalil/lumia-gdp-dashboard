/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HERMES_BASE_URL?: string;
  readonly VITE_PYTH_GDP_FEED_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
