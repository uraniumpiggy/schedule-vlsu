import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';

@NgModule({
    declarations: [
        ButtonComponent
    ],
    imports: [
        MatButtonModule,
        MatIconModule,
        CommonModule
    ],
    exports: [
        ButtonComponent
    ]
})

export class ButtonModule { }
