import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'Schedule';

  toggle: boolean = false;

  updateContent(togglePage: boolean) {
      this.toggle = togglePage;
  }
}
