// Parse a "column range" string into an ordered, de-duplicated list of column
// letters. Accepts ranges ("A-Z"), comma lists ("A,B,C,D"), and a mix
// ("A-C, F, H-J"). Whitespace and casing are irrelevant: "a  - c ,  f" works.

function colToNum(letters) {
  let n = 0;
  for (const ch of letters) {
    n = n * 26 + (ch.charCodeAt(0) - 64); // 'A' -> 1
  }
  return n;
}

function numToCol(n) {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * @param {string} input - e.g. "A-Z", "A,B,C", "A - C, F, H-J"
 * @returns {string[]} ordered, de-duplicated uppercase column letters
 */
export function parseColumnRange(input) {
  if (!input || typeof input !== "string") return [];
  const result = [];
  const seen = new Set();

  for (const rawToken of input.split(",")) {
    const token = rawToken.replace(/\s+/g, "").toUpperCase();
    if (!token) continue;

    const dash = token.indexOf("-");
    if (dash !== -1) {
      const start = token.slice(0, dash);
      const end = token.slice(dash + 1);
      if (!/^[A-Z]+$/.test(start) || !/^[A-Z]+$/.test(end)) continue;
      let lo = colToNum(start);
      let hi = colToNum(end);
      if (lo > hi) [lo, hi] = [hi, lo];
      for (let n = lo; n <= hi; n++) {
        const col = numToCol(n);
        if (!seen.has(col)) {
          seen.add(col);
          result.push(col);
        }
      }
    } else {
      if (!/^[A-Z]+$/.test(token)) continue;
      if (!seen.has(token)) {
        seen.add(token);
        result.push(token);
      }
    }
  }
  return result;
}
