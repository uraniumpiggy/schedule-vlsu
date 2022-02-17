import { NgModule } from '@angular/core';
import { ButtonModule } from './button/button.module';

import { AppbarComponent } from './appbar.component';


@NgModule({
    declarations: [
        AppbarComponent,
    ],
    imports: [
        ButtonModule
    ],
    exports: [
        AppbarComponent,
    ]
})

export class AppbarModule { }
