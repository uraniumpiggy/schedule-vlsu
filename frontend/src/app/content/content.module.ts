import { NgModule } from '@angular/core';

import { ContentComponent } from './content.component';
import { CalendarComponent } from './calendar/calendar.component';

@NgModule({
    declarations: [
        ContentComponent,
        CalendarComponent
    ],
    exports: [
        ContentComponent,
        CalendarComponent
    ]
})

export class ContentModule { }
