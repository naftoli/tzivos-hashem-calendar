export const MIVTZA_BY_HEBREW_MONTH: Record<string, string[]> = {
  'Tishrei': ['Shofar', 'Lulav'],
  'Cheshvan': ['Tzivos Hashem Registration'],
  'MarCheshvan': ['Tzivos Hashem Registration'],
  'Kislev': ['Chanukah'],
  'Teves': ['Bayis Molei Seforim'],
  'Shevat': ['Cheder Tzivos Hashem', 'Neshek'],
  'Adar I': ['Yom Huledes'],
  'Adar II': ['Purim'],
  'Adar': ['Yom Huledes'],
  'Nissan': ['Matzah'],
  'Iyar': ["Lag B'omer"],
  'Sivan': ['Ois Besefer Torah', 'Aseres Hadibros'],
  'Tammuz': [],
  'Av': ['Tzivos Hashem Registration'],
  'Elul': ['Tzivos Hashem Registration'],
};

/**
 * Returns formatted subtitle string or array based on space constraints.
 */
export function getMivtzaSubtitles(hebrewMonthName: string): string[] {
  if (!hebrewMonthName) return [];
  
  const monthNameLower = hebrewMonthName.toLowerCase();
  
  // Sort keys by length (descending) so 'Adar II' matches before 'Adar'
  const keysSorted = Object.keys(MIVTZA_BY_HEBREW_MONTH).sort((a, b) => b.length - a.length);

  const matchedKey = keysSorted.find((key) =>
    monthNameLower.includes(key.toLowerCase())
  );

  return matchedKey ? MIVTZA_BY_HEBREW_MONTH[matchedKey] || [] : [];
}