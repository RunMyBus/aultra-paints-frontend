import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {ApiRequestService} from "../services/api-request.service";
import {ApiUrlsService} from "../services/api-urls.service";
import Swal from 'sweetalert2';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent extends Unsubscribable {
  name: string = '';
  email: string = '';
  mobile: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = ''; 

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiRequestService,
    private ApiUrls: ApiUrlsService
  ) { super(); }

  register() {

    this.errorMessage = '';

    // Make the API call for registration
    this.apiService.create(this.ApiUrls.register, { name: this.name, mobile: this.mobile, email: this.email, password: this.password }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Registration successful:', response.message);
        this.successMessage = 'Registration successful! You can now log in.';
        this.errorMessage = ''; 
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);

        // Extract error message from the API response
        if (error && error.error && error.error.message) {
          this.errorMessage = error.error.message; 
        } else {
          this.errorMessage = error.message || 'An unexpected error occurred. Please try again.'; 
        }
        this.successMessage = ''; 
      }
    });
  }
}