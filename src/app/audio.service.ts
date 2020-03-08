import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, interval, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private timeUpdateSub: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  timeUpdate$: Observable<number> = this.timeUpdateSub.asObservable();
  private durationSub: Subject<number> = new Subject<number>();
  duration$: Observable<number> = this.durationSub.asObservable();

  bgm: HTMLAudioElement;

  private playlist = new Map<number, HTMLAudioElement>();
  private bgmVolume = 0.3;
  private se: HTMLAudioElement;
  private index = 0;

  currentVoice(): HTMLAudioElement {
    if (!this.playlist.get(this.index)) {
      return null;
    }
    return this.playlist.get(this.index);
  }

  setPlaylist(playlist: string[]) {
    playlist.forEach((path: string, i: number) => {
      const voice = new Audio(path);
      voice.onloadedmetadata = () => this.onLoadedmetadata(voice);
      voice.ontimeupdate = () => this.timeUpdateSub.next(voice.currentTime);
      voice.onplay = () => this.durationSub.next(voice.duration);
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
    } else if (this.isMobileSafari()) {
      // Mobile SafariはHTMLAudioElementの音量を変更することができないため、
      // 強制的に音声を停止する
      this.bgm.pause();
      voice.pause();
    } else {
      const msec = 3000;
      const int = 100;
      const diff = this.bgmVolume * int / msec;
      interval(int).pipe(take(msec / int)).subscribe(() => {
        this.bgm.volume = Math.max(0, this.bgm.volume - diff);
        if (this.bgm.volume === 0) {
          this.bgm.pause();
          voice.pause();
          this.index = 0;
          this.playlist.clear();
          this.timeUpdateSub.next(0);
        }
      });
    }
  }

  setBgm(src: string) {
    this.bgm = new Audio(src);
    this.bgm.volume = this.bgmVolume;
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

  playing(): boolean {
    if (!this.playlist.get(this.index)) {
      return false;
    }
    return !this.playlist.get(this.index).paused;
  }

  private hasNext(): boolean {
    return this.playlist.size > this.index + 1;
  }

  private isMobileSafari(): boolean {
    const regex = /version\/([\w.]+).+?mobile\/\w+\s(safari)/i; // > [splited UA, Browser Version, BrowserName]
    const ua = window.navigator.userAgent.toLocaleLowerCase();
    return !!ua.match(regex);
  }
}
