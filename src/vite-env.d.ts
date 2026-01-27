/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_YOUTUBE_API_KEY: string
    readonly REACT_APP_SEARCH_SERVICE_ENABLED: string
    readonly REACT_APP_SEARCH_SERVICE_URL: string
    readonly REACT_APP_SEARCH_SERVICE_TIMEOUT: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}