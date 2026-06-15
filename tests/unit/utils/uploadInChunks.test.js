import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { uploadInChunks, CHUNK_SIZE, CHUNK_THRESHOLD } from "@/utils/uploadInChunks";

vi.mock("axios");

function makeFile(name, size) {
  const file = new File(["x"], name, { type: "application/octet-stream" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("uploadInChunks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes sane threshold/size constants", () => {
    expect(CHUNK_THRESHOLD).toBeGreaterThan(0);
    expect(CHUNK_SIZE).toBeGreaterThan(0);
  });

  it("runs init -> chunks -> complete and reports progress", async () => {
    const urls = [];
    axios.post.mockImplementation((url) => {
      urls.push(url);
      if (url.endsWith("/upload/init")) {
        return Promise.resolve({ data: { upload_id: "u1", chunk_size: CHUNK_SIZE } });
      }
      if (url.includes("/upload/chunk/")) return Promise.resolve({ data: {} });
      if (url.includes("/upload/complete/")) {
        return Promise.resolve({ data: { file_id: 7, duplicate: false } });
      }
      return Promise.resolve({ data: {} });
    });

    const file = makeFile("big.xlsx", 2 * CHUNK_SIZE); // exactly 2 chunks
    const progress = [];
    const result = await uploadInChunks(file, "http://api", "tok", (p) => progress.push(p));

    expect(result).toEqual({ file_id: 7, duplicate: false });
    expect(progress).toEqual([50, 100]);
    expect(urls).toEqual([
      "http://api/upload/init",
      "http://api/upload/chunk/u1",
      "http://api/upload/chunk/u1",
      "http://api/upload/complete/u1",
    ]);
  });

  it("works without an onProgress callback", async () => {
    axios.post.mockImplementation((url) => {
      if (url.endsWith("/upload/init")) return Promise.resolve({ data: { upload_id: "u2" } });
      if (url.includes("/upload/complete/")) return Promise.resolve({ data: { file_id: 8 } });
      return Promise.resolve({ data: {} });
    });
    const file = makeFile("one.xlsx", 1); // single chunk
    const result = await uploadInChunks(file, "http://api", "tok");
    expect(result).toEqual({ file_id: 8 });
  });

  it("aborts the session and rethrows when a chunk fails", async () => {
    axios.post.mockImplementation((url) => {
      if (url.endsWith("/upload/init")) return Promise.resolve({ data: { upload_id: "u3" } });
      if (url.includes("/upload/chunk/")) return Promise.reject(new Error("chunk boom"));
      if (url.includes("/upload/abort/")) return Promise.resolve({ data: {} });
      return Promise.resolve({ data: {} });
    });
    const file = makeFile("fail.xlsx", 1);
    await expect(uploadInChunks(file, "http://api", "tok", () => {})).rejects.toThrow("chunk boom");
    expect(axios.post).toHaveBeenCalledWith("http://api/upload/abort/u3", {}, expect.any(Object));
  });

  it("rethrows the original error even if abort also fails", async () => {
    axios.post.mockImplementation((url) => {
      if (url.endsWith("/upload/init")) return Promise.resolve({ data: { upload_id: "u4" } });
      if (url.includes("/upload/chunk/")) return Promise.reject(new Error("chunk boom"));
      if (url.includes("/upload/abort/")) return Promise.reject(new Error("abort boom"));
      return Promise.resolve({ data: {} });
    });
    const file = makeFile("fail2.xlsx", 1);
    await expect(uploadInChunks(file, "http://api", "tok")).rejects.toThrow("chunk boom");
  });
});
