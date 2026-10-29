import type { NextConfig } from 'next';
import { MAX_ACTION_BODY_BYTES, MAX_PROXY_BODY_BYTES } from './lib/upload-limits';
const config: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: MAX_PROXY_BODY_BYTES,
    serverActions: { bodySizeLimit: MAX_ACTION_BODY_BYTES },
  },
};
export default config;
