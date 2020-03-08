import { Component, ViewEncapsulation, AfterViewInit, OnInit, OnDestroy, Input } from '@angular/core';
import { AudioService } from '../audio.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AudioPlayerComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() voices: string[];
  @Input() bgm: string;
  @Input() se: string;

  value$ = new BehaviorSubject<number>(0);
  duration$ = this.audio.duration$;

  private audioSub: Subscription;
  private max = 100;

  private progressDragging = false;
  private processArea: HTMLElement;
  private processAreaBoundingClientRect: DOMRect;
  private touchAreaValue: number;

  constructor(private audio: AudioService) {}

  ngOnInit() {
    this.audioSub = this.audio.timeUpdate$.subscribe((u: number) => {
      if (!this.progressDragging) {
        this.value$.next(u);
      }
    });
  }

  ngAfterViewInit() {
    this.processArea = document.getElementById('touch-area');
    this.registProccesAreaEventHandling();
  }

  ngOnDestroy(): void {
    this.audioSub.unsubscribe();
  }

  onPlay() {
    if (!this.audio.currentVoice()) {
      this.audio.setPlaylist(this.voices);
      this.audio.setBgm(this.bgm);
      this.audio.setSe(this.se);
    }

    this.audio.bgm.play();
    this.audio.play();
  }

  duration(): number {
    if (!this.audio.currentVoice()) {
      return this.max;
    }
    return this.audio.currentVoice().duration;
  }

  onPause() {
    this.audio.pause();
  }

  playing(): boolean {
    return this.audio.playing();
  }

  changeValue(e: number) {
    if (!this.audio.currentVoice()) {
      return;
    }
    this.progressDragging = false;
    this.value$.next(e);
    this.audio.currentVoice().currentTime = e;
  }

  updateProgress(e: number) {
    if (!this.audio.currentVoice()) {
      return;
    }
    this.progressDragging = true;
    this.value$.next(e);
  }

  private registProccesAreaEventHandling() {
    if (!this.processArea) {
      return;
    }

    this.processAreaBoundingClientRect =  this.processArea.getBoundingClientRect();
    this.processArea.addEventListener('touchstart', (event) => {
      this.handleProcessAreaTouchStart(event);
    });
    this.processArea.addEventListener('touchmove', (event) => {
      this.handleProcessAreaTouchMove(event);
    });
    this.processArea.addEventListener('touchend', () => {
      this.handleProcessAreaTouchEnd();
    });

  }

  private handleProcessAreaTouchStart(event) {
    this.touchAreaValue = this.evaluateXcoordinateToDurationValue(event.touches[0].clientX, this.processAreaBoundingClientRect);
  }

  private handleProcessAreaTouchMove(event) {
    this.touchAreaValue = this.evaluateXcoordinateToDurationValue(event.touches[0].clientX, this.processAreaBoundingClientRect);
    this.updateProgress(this.touchAreaValue);
    this.stopProgation(event);
  }

  private handleProcessAreaTouchEnd() {
    this.changeValue(this.touchAreaValue);
  }

  private evaluateXcoordinateToDurationValue(xCoordinate, AreaBoundingCLientRect) {
    let durationInPercent = (xCoordinate - AreaBoundingCLientRect.left) / AreaBoundingCLientRect.width;
    if (durationInPercent < 0) {
      durationInPercent = 0;
    } else if (durationInPercent > 100) {
      durationInPercent = 100;
    }
    return this.duration() * durationInPercent;
  }

  private stopProgation(event: TouchEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
