/**
 * Returns API error message from axios error or fallback.
 * Extracted so fallback branches can be covered by unit tests.
 * @param {unknown} err - Caught error (e.g. axios error)
 * @param {string} fallback - Message when err.response?.data?.error is falsy
 * @returns {string}
 */
export function getApiErrorMessage(err, fallback) {
  return err?.response?.data?.error || fallback;
}
