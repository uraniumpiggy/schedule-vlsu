import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppbarModule } from './appbar/appbar.module';
import { ContentModule } from './content/content.module';
import { GroupsModule } from './groups/groups.module';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppbarModule,
    ContentModule,
    GroupsModule,
    NoopAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
