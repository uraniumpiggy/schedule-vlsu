import { Component, Output, EventEmitter } from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-appbar',
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.scss'],
  animations: [
    trigger('appbar-container', [
      state('start', style({ background: '#176DEE' })),
      state('end', style({ background: 'white' })),
      transition('start <=> end', animate(250)),
    ])
  ]
})

export class AppbarComponent {

    appbarState = 'start';
    handler: boolean = false;

    @Output() togglePage: EventEmitter<boolean> = new EventEmitter<boolean>();

    animate() {
        this.appbarState = this.appbarState === 'end' ? 'start' : 'end';
        this.handler = !this.handler;
        this.togglePage.emit(this.handler);
    }
}
