export function cleanYoutubeTitle(title: string): string {
  // Patterns to remove: includes various brackets, common keywords, and quality indicators
  const patternsToRemove = [
    /\[.*?\]/g, // Matches anything in square brackets
    /\(.*?\)/g, // Matches anything in parentheses
    /\{.*?\}/g, // Matches anything in curly braces
    /HD|4K|1080p|720p/gi, // Quality indicators
    /official (video|music video)|lyrics|remix|cover|live|extended version|sub Español/gi, // Common keywords
    /\s*\*+\s?\S+\s?\*+$/, // Ends with asterisks around words
    /\s*\[[^\]]+\]$/, // Square brackets at the end
    /\s*\([^\)]*version\)$/i, // Parentheses containing the word 'version' at the end
    /\s*\.(avi|wmv|mpg|mpeg|flv)$/i, // File extensions
    /\s*video\s*clip/i, // 'video clip'
    /\s*(of+icial\s*)?(music\s*)?video/i, // 'official video', 'music video'
    /\s*(ALBUM TRACK\s*)?(album track\s*)/i, // 'ALBUM TRACK'
    /\s*\(\s*of+icial\s*\)/i, // '(official)' in parentheses
    /\s*\(\s*[0-9]{4}\s*\)/i, // Year in parentheses
    /\s+\(\s*(HD|HQ)\s*\)$/, // HD or HQ in parentheses at the end
    /\s+(HD|HQ)\s*$/, // HD or HQ at the end
    /\s+\(?live\)?$/i, // 'live' at the end
    /\(\s*\)/, // Empty parentheses
    /\(.*lyrics?\)/i, // Parentheses containing 'lyrics'
    /\(.*ft.?\)/i, // Parentheses containing 'ft.'
    /\s*with\s+lyrics?\s*$/i, // 'with lyrics' at the end
    /'/g, // Single quotes
    /^[\/\s,:;~-\s"]+/, // Leading special characters
    /[\/\s,:;~-\s"\s!]+$/, // Trailing special characters
    /\((.*?)\)/g, // Anything in parentheses (general case)
    /(?:[1-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:(?:[2468][048]|[13579][26])00)/, // Specific pattern (looks like a year leap year detection, might need review if incorrectly applied)
  ];

  let cleanedTitle = title;
  patternsToRemove.forEach((pattern) => {
    cleanedTitle = cleanedTitle.replace(pattern, '');
  });

  // Remove multiple spaces with a single space and trim
  return cleanedTitle.replace(/\s+/g, ' ').trim();
}
