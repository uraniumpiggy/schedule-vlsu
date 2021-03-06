import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppbarModule } from './appbar/appbar.module';
import { ContentModule } from './content/content.module';
import { GroupsModule } from './groups/groups.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { AppComponent } from './app.component';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppbarModule,
    ContentModule,
    GroupsModule,
    BrowserAnimationsModule
  ],
  exports: [
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
