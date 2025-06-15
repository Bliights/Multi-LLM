import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UsersService} from '../generated';
import {Observable, of, throwError, BehaviorSubject} from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private refreshing = false;
  private userIdSubject = new BehaviorSubject<string | null>(null);
  public userId$ = this.userIdSubject.asObservable();

  constructor(private userService: UsersService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.userService.usersInfoMeGet().pipe(
      map(user => {
        console.log('AuthGuard: User authenticated', user);
        this.userIdSubject.next(user.id);
        return true;
      }),
      catchError(error => {
        console.error('AuthGuard: Authentication check failed', error);

        if (error.status === 401 && !this.refreshing) {
          console.log('Attempting token refresh...');
          this.refreshing = true;

          return this.userService.usersRefreshTokenPost().pipe(
            switchMap(() => {
              console.log('Token refreshed, retrying authentication...');
              this.refreshing = false;
              return this.userService.usersInfoMeGet();
            }),
            map(user => {
              console.log('AuthGuard: User authenticated after refresh', user);
              this.userIdSubject.next(user.id);
              return true;
            }),
            catchError(refreshError => {
              console.error('AuthGuard: Refresh token failed', refreshError);
              this.refreshing = false;
              this.router.navigate(['/login']);
              return of(false);
            })
          );
        }

        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
