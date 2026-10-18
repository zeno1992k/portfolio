/** Value notation for content checks, without JSON's NaN/undefined conversion. */
export function formatQuizLogValue(value: unknown, nested = false): string {
  if (typeof value === 'string') return nested ? JSON.stringify(value) : value;
  if (typeof value === 'number') return Object.is(value, -0) ? '-0' : String(value);
  if (typeof value === 'bigint') return String(value) + 'n';
  if (value === null || typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return '[' + value.map(item => formatQuizLogValue(item, true)).join(',') + ']';
  return '{' + Object.entries(value).map(([key, item]) => JSON.stringify(key) + ':' + formatQuizLogValue(item, true)).join(',') + '}';
}
