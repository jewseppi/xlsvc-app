// Parse a comma-separated "sheets to remove" string into a de-duplicated list
// of entries. Each entry is either a sheet name or a 1-based index; both are
// kept as trimmed strings (the backend resolves names case-insensitively and
// treats all-digit entries as indices). Casing/spacing are irrelevant.

/**
 * @param {string} input - e.g. "Summary, 3, raw data"
 * @returns {string[]} trimmed, de-duplicated (case-insensitive) entries
 */
export function parseSheetList(input) {
  if (!input || typeof input !== "string") return [];
  const result = [];
  const seen = new Set();
  for (const raw of input.split(",")) {
    const token = raw.trim();
    if (!token) continue;
    const key = token.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(token);
    }
  }
  return result;
}
