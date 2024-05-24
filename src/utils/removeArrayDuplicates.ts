import { SpotifyTrack } from '../external/spotify/getSimilarTracks';

export function removeTrackDuplicates(tracks: SpotifyTrack[]): SpotifyTrack[] {
  const seenSpotifyIds = new Set<string>();
  const seenTitles = new Set<string>();

  return tracks.filter((track) => {
    // Check if either spotifyId or title has been seen
    const isDuplicate =
      seenSpotifyIds.has(track.id) || seenTitles.has(track.title);

    // If not a duplicate, add spotifyId and title to their respective sets
    if (!isDuplicate) {
      seenSpotifyIds.add(track.id);
      seenTitles.add(track.title);
      return true;
    }
    return false;
  });
}
