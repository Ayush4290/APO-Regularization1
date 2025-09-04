import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../common/shared-module';
import { LoaderService } from '../services/loader-service';

@Component({
  selector: 'app-spinner',
  imports: [SharedModule],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css'
})
export class Spinner {
  showLoader: boolean = false;
  constructor(public loader: LoaderService) {
  }
}
