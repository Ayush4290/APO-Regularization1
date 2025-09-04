import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = 'en';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  changeLanguage() {
    this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
    this.translate.use(this.currentLanguage);
  }
}