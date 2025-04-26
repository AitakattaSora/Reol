export function cleanYoutubeTitle(title: string): string {
  const patternsToRemove = [
    /\[.*?\]/g,
    /\(.*?\)/g,
    /\{.*?\}/g,
    /HD|4K|1080p|720p/gi,
    /official (video|music video)|lyrics|remix|cover|live|extended version|sub español/gi,
    /\s*\*+\s?\S+\s?\*+$/,
    /\s*\[[^\]]+\]$/,
    /\s*\([^\)]*version\)$/i,
    /\s*\.(avi|wmv|mpg|mpeg|flv)$/i,
    /\s*video\s*clip/i,
    /\s*(of+icial\s*)?(music\s*)?video/i,
    /\s*(ALBUM TRACK\s*)?(album track\s*)/i,
    /\s*\(\s*of+icial\s*\)/i,
    /\s*\(\s*[0-9]{4}\s*\)/i,
    /\s+\(\s*(HD|HQ)\s*\)$/,
    /\s+(HD|HQ)\s*$/,
    /\s+\(?live\)?$/i,
    /\(\s*\)/,
    /\(.*lyrics?\)/i,
    /\s*with\s+lyrics?\s*$/i,
    /^[\/\s,:;~-\s"]+/, // Leading special chars
    /[\/\s,:;~-\s"\s!]+$/, // Trailing special chars
    /\s+(feat\.?|ft\.?|featuring)\s+[^\-]+(?=\s*-\s*)/i,
    /\s+(feat\.?|ft\.?|featuring)\s+.+$/i,
    /\s*\|[^\-]*/g, // Remove from "|" to next "-" or end
  ];

  let cleanedTitle = title;

  patternsToRemove.forEach((pattern) => {
    cleanedTitle = cleanedTitle.replace(pattern, '');
  });

  // Normalize spaces
  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();

  // Normalize dashes (always 1 space around)
  cleanedTitle = cleanedTitle.replace(/\s*-\s*/g, ' - ');

  return cleanedTitle;
}
