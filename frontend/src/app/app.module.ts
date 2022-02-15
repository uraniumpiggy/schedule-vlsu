import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppbarComponent } from './appbar/appbar.component';
import { ContentComponent } from './content/content.component';
import { GroupsComponent } from './groups/groups.component';
import { CalendarComponent } from './calendar/calendar.component';



@NgModule({
  declarations: [
    AppComponent,
    AppbarComponent,
    ContentComponent,
    GroupsComponent,
    CalendarComponent
],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
