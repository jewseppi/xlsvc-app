import axios from "axios";

// Files larger than this are uploaded in chunks instead of a single request,
// to stay under the backend per-request size limit (and shared-host limits).
export const CHUNK_THRESHOLD = 50 * 1024 * 1024; // 50MB
export const CHUNK_SIZE = 8 * 1024 * 1024; // 8MB per chunk

/**
 * Upload a large file in chunks: init -> chunk* -> complete.
 *
 * Calls onProgress(percent) after each chunk. On any failure it best-effort
 * aborts the server-side session, then rethrows the original error.
 *
 * @returns the completion response data (same shape as POST /api/upload).
 */
export async function uploadInChunks(file, apiBase, token, onProgress) {
  const headers = { Authorization: `Bearer ${token}` };
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  const initRes = await axios.post(
    `${apiBase}/upload/init`,
    { filename: file.name, total_size: file.size, total_chunks: totalChunks },
    { headers }
  );
  const uploadId = initRes.data.upload_id;

  try {
    for (let index = 0; index < totalChunks; index++) {
      const start = index * CHUNK_SIZE;
      const blob = file.slice(start, start + CHUNK_SIZE);
      const form = new FormData();
      form.append("chunk", blob);
      form.append("index", String(index));
      await axios.post(`${apiBase}/upload/chunk/${uploadId}`, form, { headers });
      if (onProgress) {
        onProgress(Math.round(((index + 1) * 100) / totalChunks));
      }
    }
    const completeRes = await axios.post(
      `${apiBase}/upload/complete/${uploadId}`,
      {},
      { headers }
    );
    return completeRes.data;
  } catch (err) {
    // Best-effort cleanup of the partial upload; never mask the original error.
    try {
      await axios.post(`${apiBase}/upload/abort/${uploadId}`, {}, { headers });
    } catch {
      // ignore abort failures
    }
    throw err;
  }
}
