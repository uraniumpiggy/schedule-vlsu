import { NgModule } from '@angular/core';
import { CardlistModule } from './cardlist/cardlist.module';

import { ContentComponent } from './content.component';
import { CalendarComponent } from './calendar/calendar.component';

@NgModule({
    declarations: [
        ContentComponent,
        CalendarComponent,
    ],
    imports: [
        CardlistModule
    ],
    exports: [
        ContentComponent,
        CalendarComponent,
    ]
})

export class ContentModule { }
