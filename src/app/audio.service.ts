import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private timeUpdateSub: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  timeUpdate: Observable<number> = this.timeUpdateSub.asObservable();
  bgm: HTMLAudioElement;

  private playlist = new Map<number, HTMLAudioElement>();
  private se: HTMLAudioElement;
  private index = 0;

  currentVoice(): HTMLAudioElement {
    if (!this.playlist.get(this.index)) {
      return null;
    }
    return this.playlist.get(this.index);
  }

  duration(): number {
    if (!this.playlist.get(this.index)) {
      return 0;
    }
    return this.playlist.get(this.index).duration;
  }

  setPlaylist(playlist: string[]) {
    playlist.forEach((path: string, i: number) => {
      const voice = new Audio(path);
      voice.onloadedmetadata = () => this.onLoadedmetadata(voice);
      voice.ontimeupdate = () => this.timeUpdateSub.next(voice.currentTime);
      voice.onpause = () => this.onPause(voice);
      voice.onended = () => this.onEnded(voice);
      this.playlist.set(i, voice);
    });
  }

  private onPause(voice: HTMLAudioElement) {
    if (voice.currentTime !== voice.duration) {
      this.bgm.pause();
    }
  }

  private onLoadedmetadata(voice: HTMLAudioElement) {
    let time = voice.currentTime;
    requestAnimationFrame(function u() {
      if (time !== voice.currentTime) {
        time = voice.currentTime;
        voice.dispatchEvent(new CustomEvent('timeupdate'));
      }
      requestAnimationFrame(u);
    });
  }

  private onEnded(voice: HTMLAudioElement) {
    if (this.hasNext()) {
      this.se.play();
    } else {
      this.bgm.pause();
      voice.pause();
    }
  }

  setBgm(src: string) {
    this.bgm = new Audio(src);
    this.bgm.volume = 0.3;
    this.bgm.loop = true;
  }

  setSe(src: string) {
    this.se = new Audio(src);
    this.se.onended = () => {
      this.index++;
      this.playlist.get(this.index).play();
    };
  }

  play(): void {
    this.playlist.get(this.index).play();
  }

  pause(): void {
    this.playlist.get(this.index).pause();
    this.bgm.pause();
  }

  private hasNext(): boolean {
    return this.playlist.size > this.index + 1;
  }
}
