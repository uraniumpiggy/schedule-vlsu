import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { CardlistComponent } from './cardlist.component';
import { CardComponent } from './card/card.component';

@NgModule({
    declarations: [
        CardlistComponent,
        CardComponent
    ],
    exports: [
        CardlistComponent,
        CardComponent
    ],
    imports: [
        MatListModule
    ]
})

export class CardlistModule {}
