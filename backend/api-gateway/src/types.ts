export interface Route {
  url: string;
  auth: boolean;
  creditCheck: boolean;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  proxy: {
    target: string;
    router?: { [key: string]: string };
    changeOrigin: boolean;
    pathFilter?: string;
    pathRewrite?: { [key: string]: string };
  };
}
