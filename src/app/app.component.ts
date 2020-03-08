import { Component, Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { AudioPlayerComponent } from './audio-player/audio-player.component';

@Component({
  selector: 'v-audio-player',
  template: ``,
})
export class AppComponent  {
  constructor(
    private injector: Injector,
  ) {
    const AppElement = createCustomElement(
      AudioPlayerComponent,
      { injector: this.injector }
    );
    customElements.define('v-audio-player', AppElement);
  }
}
