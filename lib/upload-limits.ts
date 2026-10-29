export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
// Leave room for multipart fields, then keep proxy buffering above the action limit.
export const MAX_ACTION_BODY_BYTES = 21 * 1024 * 1024;
export const MAX_PROXY_BODY_BYTES = 22 * 1024 * 1024;
export const MIN_PREVIEW_SHORT_EDGE = 180;
export const MIN_PREVIEW_LONG_EDGE = 360;
