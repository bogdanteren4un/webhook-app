/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "disabled" to run without the MSW mock. */
  readonly VITE_API_MOCKING?: string
}
