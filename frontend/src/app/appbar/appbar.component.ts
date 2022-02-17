import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-appbar',
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.scss']
})

export class AppbarComponent {

    handler: boolean = false;
    @Output() togglePage: EventEmitter<boolean> = new EventEmitter<boolean>();

    updateAppbarColor(toggleAppbarColor: boolean)
    {
        this.handler = toggleAppbarColor;
        this.togglePage.emit(this.handler);
    }
}
