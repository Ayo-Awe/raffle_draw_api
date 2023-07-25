/**
 * Parses a string to an integer and returns
 * the result if successful otherwise the original
 * string
 * @param str string
 */
export function tryParseInt(str: string) {
  const parsedInt = parseInt(str);
  return isNaN(parsedInt) ? str : parsedInt;
}
