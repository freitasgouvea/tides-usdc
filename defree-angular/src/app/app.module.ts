import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxSpinnerModule } from "ngx-spinner";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LandingComponent } from './pages/landing/landing.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarService } from './services/sidebar.service';
import { MetamaskService } from './services/metamask.service';
import { ApproveFormComponent } from './component/approve-form/approve-form.component';
import { SendListComponent } from './component/send-list/send-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomFormsModule } from 'ngx-custom-validators';
import { DataService } from './services/data.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    LandingComponent,
    ApproveFormComponent,
    SendListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    CustomFormsModule
  ],
  providers: [
    SidebarService,
    MetamaskService,
    DataService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
