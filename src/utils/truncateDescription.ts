export function truncateLongDescription(description: string) {
  return description.length >= 4096
    ? description.substring(0, 4000) +
        '...\nContent is larger than character limit...'
    : description;
}
