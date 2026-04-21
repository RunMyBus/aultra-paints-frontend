import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../services/auth.service';


@Injectable({providedIn: 'root'})

export class AuthGuard implements CanActivate {
  constructor(
      private router: Router,
      private authService: AuthService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authenticated = this.authService.isAuthenticated();

    // Authenticated user hitting /login: redirect home.
    if (state.url === '/login' && authenticated) {
      this.router.navigate(['/']);
      return false;
    }

    if (authenticated) {
      return true;
    }

    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
