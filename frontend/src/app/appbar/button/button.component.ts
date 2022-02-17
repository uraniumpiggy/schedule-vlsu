import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss']
})

export class ButtonComponent {

    toggleAppbarColor = false;
    @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();

    buttonClick() {
        this.toggleAppbarColor = !this.toggleAppbarColor;
        this.toggle.emit(this.toggleAppbarColor);
    }

}
