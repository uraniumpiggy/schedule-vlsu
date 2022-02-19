import { NgModule } from '@angular/core';

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
    ]
})

export class CardlistModule {}
