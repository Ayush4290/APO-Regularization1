import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private valueSource = new Subject<string>();

  // Observable stream that components can subscribe to
  currentValue = this.valueSource.asObservable();

  // Method to push a new value to the stream
  passValue(newValue: string) {
    this.valueSource.next(newValue);
  }
}