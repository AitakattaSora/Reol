export function getSpotifyTrackTitle(track: any) {
  const artists = track.artists || [];

  let artistsString = '';
  artists.forEach((artist: any, idx: number) => {
    if (idx === artists.length - 1 || artists.length === 1) {
      return (artistsString += artist.name);
    }

    artistsString += artist.name + ', ';
  });

  return `${artistsString} - ${track.name}`;
}
