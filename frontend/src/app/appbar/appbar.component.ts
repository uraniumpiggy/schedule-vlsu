import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-appbar',
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.scss']
})
export class AppbarComponent {

    backgroundToggle = false;
    @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();

    buttonClick() {
        this.backgroundToggle = !this.backgroundToggle;
        this.toggle.emit(this.backgroundToggle);
    }

}
