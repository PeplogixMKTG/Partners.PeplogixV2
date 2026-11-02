export {};
declare global {
  interface Window {
    __MANUS_CONFIG__?: {
      projectId: string;
      oauthPortalUrl: string;
      apiUrl: string;
      apiBrowserKey: string;
      authMode?: "password" | "manus" | "unconfigured";
    };
  }
}
