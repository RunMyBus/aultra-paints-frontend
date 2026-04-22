import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ApiUrlsService } from "./api-urls.service";
import { ActivatedRoute, Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  returnUrl: string = '';

  constructor(
      private http: HttpClient,
      private apiUrls: ApiUrlsService,
      private router: Router,
      private route: ActivatedRoute
  ) {
    // Check if `localStorage` is available before accessing it
    const storedToken = this.isLocalStorageAvailable()
        ? JSON.parse(localStorage.getItem('authToken') || 'null')
        : null;

    this.currentUserSubject = new BehaviorSubject<any>(storedToken);
    this.currentUser = this.currentUserSubject.asObservable();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Helper to check if `localStorage` is available
  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): any | null {
    if (!this.isLocalStorageAvailable()) return null;
    const stored = JSON.parse(localStorage.getItem('authToken') || 'null');
    if (!stored) return null;
    // Authenticated only when the bearer token is present and unexpired.
    if (this.isTokenExpired(stored.token)) {
      this.clearStoredAuth();
      return null;
    }
    return stored;
  }

  // Best-effort JWT exp check. Unverified signature is OK: the server is
  // the source of truth; this check is only to avoid shipping a known-stale
  // token on UI transitions.
  public isTokenExpired(token?: string): boolean {
    const jwt = token || this.currentUserValue?.token;
    if (!jwt || typeof jwt !== 'string') return true;
    const parts = jwt.split('.');
    if (parts.length !== 3) return false; // Not a JWT we can introspect — let the server decide.
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof payload.exp !== 'number') return false;
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  public getAccountType(): string | null {
    return this.currentUserValue?.accountType || null;
  }

  public hasRole(...roles: string[]): boolean {
    const accountType = this.getAccountType();
    return !!accountType && roles.includes(accountType);
  }

  private clearStoredAuth(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
  }


   // Method to send OTP to the provided mobile number
   loginWithOTP(mobile: string): Observable<any> {
    return this.http.post<any>(this.apiUrls.mainUrl + 'auth/loginWithOTP', { mobile })
      .pipe(map(response => {
        if (response) {
          return response;
        }
      }));
  }

  // Method to verify the OTP entered by the user
  verifyOTP(mobile: string, otp: number): Observable<any> {
    return this.http.post<any>(this.apiUrls.mainUrl + 'auth/verifyOTP', { mobile, otp })
      .pipe(map(response => {
        if (response) {
          if (this.isLocalStorageAvailable()) {
            localStorage.setItem('authToken', JSON.stringify(response));
          }
            this.currentUserSubject.next(response);
          // Navigate to the dashboard or specified route
          this.router.navigate(['/']);
        }
        return response;
      }));
  }
  

  logOut(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('authToken');
    }
    this.router.navigate(['/login']);
    this.currentUserSubject.next(null);
  }
}
