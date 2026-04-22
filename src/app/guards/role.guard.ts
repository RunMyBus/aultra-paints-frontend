import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Backend remains the source of truth for authorisation. This guard
// prevents non-admin navigation to admin routes so the UI never renders
// privileged surface to the wrong user — read `data.roles` on each route.
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowed = (route.data && (route.data as any)['roles']) as string[] | undefined;
    if (!allowed || allowed.length === 0) return true;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (this.authService.hasRole(...allowed)) return true;

    this.router.navigate(['/']);
    return false;
  }
}
