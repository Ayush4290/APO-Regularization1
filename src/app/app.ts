import { Component, OnInit, signal } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { SharedModule } from './common/shared-module';
import { Spinner } from "./spinner/spinner";
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { UtcMomentDateAdapter } from './common/utc-date-adapter';
import { CUSTOM_DATE_FORMATS } from './common/constants';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-root',
  imports: [
    SharedModule,
    Spinner,
    MatMomentDateModule,
    NgxExtendedPdfViewerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: UtcMomentDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor() {
  }

  ngOnInit(): void {
  }

  protected readonly title = signal('APO');
}

