export interface RadioSessionTrack {
  spotifyId: string;
  title: string;
}

export class RadioSession {
  private tracks: RadioSessionTrack[];
  public initialTrack: RadioSessionTrack;

  constructor(tracks: RadioSessionTrack[]) {
    this.tracks = tracks;
    this.initialTrack = tracks[0];
  }

  public getTracks() {
    return this.tracks;
  }

  public getNextTrack() {
    return this.tracks.shift();
  }
}
