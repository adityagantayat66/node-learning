import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { ErrorDialogComponent } from '../../shared/error-dialog/error-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const dialog = inject(MatDialog);
    const router = inject(Router);
    const authService = inject(AuthService);
    return next(req).pipe(
        catchError((error) => {
            let message = '';
            if (error.error?.status === 401) {
                authService.logout();
                router.navigate(['login']);
            }

            message =
                error.error?.message ||
                'Something went wrong. Please try again.';

            dialog.open(ErrorDialogComponent, {
                data: {
                    message,
                },
            });
            if (error.status === 401 && !router.url.includes('login')) {
                router.navigate(['login']);
                authService.logout();
            }

            return throwError(() => error);
        })
    );
};