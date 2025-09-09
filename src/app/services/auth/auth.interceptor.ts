import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../loader-service';
import { inject } from '@angular/core';

export const skip_auth = new HttpContextToken<boolean>(() => false);
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    let ls = inject(LoaderService);
    let token = sessionStorage.getItem('token');
    if (token && !req.context.get(skip_auth)) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    ls.show();
    return next(req).pipe(
        finalize(() => {
            ls.hide();
        })
    );
};