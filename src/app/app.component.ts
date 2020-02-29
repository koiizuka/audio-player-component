import { Component, ViewEncapsulation, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

  max = 100;

  set value(value: number) {
    if (!this.progressDragging) {
      this._value = value;
    }
  }
  get value() {
    return this._value;
  }
  _value = 0;

  @Output() valueChange = new EventEmitter<number>();
  @Output() inputChange = new EventEmitter<number>();

  private progressDragging = false;
  private processArea: HTMLElement;
  private processAreaBoundingClientRect: DOMRect;
  private _touchAreaValue: number;

  ngAfterViewInit() {
    this.processArea = document.getElementById('touch-area');
    this.registProccesAreaEventHandling();
  }

  changeValue(e: number) {
    this.progressDragging = false;
    this._value = e;
    this.valueChange.emit(e);
  }

  updateProgress(e: number) {
    this.progressDragging = true;
    this.inputChange.emit(e);
  }

  registProccesAreaEventHandling() {
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
    this._touchAreaValue = this.evaluateXcoordinateToDurationValue(event.touches[0].clientX, this.processAreaBoundingClientRect);
  }

  private handleProcessAreaTouchMove(event) {
    this._touchAreaValue = this.evaluateXcoordinateToDurationValue(event.touches[0].clientX, this.processAreaBoundingClientRect);
    this._value = this._touchAreaValue;
    this.updateProgress(this._touchAreaValue);
    this.stopProgation(event);
  }

  private handleProcessAreaTouchEnd() {
    this.changeValue(this._touchAreaValue);
  }

  private evaluateXcoordinateToDurationValue(xCoordinate, AreaBoundingCLientRect) {
    let durationInPercent = (xCoordinate - AreaBoundingCLientRect.left) / AreaBoundingCLientRect.width;
    if (durationInPercent < 0) {
      durationInPercent = 0;
    } else if (durationInPercent > 100) {
      durationInPercent = 100;
    }
    return this.max * durationInPercent;
  }

  private stopProgation(event: TouchEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
