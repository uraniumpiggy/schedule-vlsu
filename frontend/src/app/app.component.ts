import { Component } from '@angular/core';
import { AnimationEvent } from "@angular/animations";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
  title = 'Schedule';

  visibly: boolean = false;

  updateContent(togglePage: boolean) {
      this.visibly = togglePage;
  }

}
