import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private activeRequests = 0;
    private _isLoading = new BehaviorSubject<boolean>(false);
    readonly isLoading = this._isLoading.asObservable();
    constructor() {
    }

    show() {
        this.activeRequests++;
        this._isLoading.next(true);
    }

    hide() {
        this.activeRequests--;
        if (this.activeRequests <= 0) {
            this.activeRequests = 0; // Ensure it doesn't go below zero
            this._isLoading.next(false);
        }
    }
}