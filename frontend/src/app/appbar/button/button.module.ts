import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from './button.component';

@NgModule({
    declarations: [
        ButtonComponent
    ],
    imports: [
        MatIconModule
    ],
    exports: [
        ButtonComponent
    ]
})

export class ButtonModule { }
