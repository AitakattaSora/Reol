import { RadioSession } from '../../interfaces/Queue';

export function getRadioSessionUnplayedTracks(radioSession: RadioSession) {
  const playedSet = new Set(
    radioSession.playedTracks.map((track) => track.spotifyId)
  );

  return radioSession.tracks.filter((track) => !playedSet.has(track.spotifyId));
}
