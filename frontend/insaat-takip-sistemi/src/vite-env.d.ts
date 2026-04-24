/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Örn. http://localhost:8080 — boş bırakılırsa Vite dev proxy ( /dashboard ) kullanılır */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
