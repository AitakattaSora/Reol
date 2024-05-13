export interface RadioSessionTrack {
  spotifyId: string;
  title: string;
}

export class RadioSession {
  private tracks: RadioSessionTrack[];
  private playedTracks: RadioSessionTrack[];

  constructor(tracks: RadioSessionTrack[]) {
    this.tracks = tracks;
    this.playedTracks = [];
  }

  public getTracks() {
    return this.tracks;
  }

  public getPlayedTracks() {
    return this.playedTracks;
  }

  public getNextTrack() {
    return this.tracks.shift();
  }
}
