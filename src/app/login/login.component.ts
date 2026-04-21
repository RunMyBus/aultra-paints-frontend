import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {Component} from '@angular/core';
import {FormsModule, NgForm} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {first, takeUntil} from "rxjs";
import Swal from 'sweetalert2';
import { Unsubscribable } from '../shared/unsubscribable';


@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent extends Unsubscribable {
    mobile: string = '';
    otp: any;
    errorMessage: string = '';
    otpSuccessMessage: string = '';
    otpSent: boolean = false;
    loading: boolean = false;

    constructor(private router: Router, private authService: AuthService) {
        super();
    }

    ngOnInit(): void {
    }

    handleMobileChange(): void {
        this.clearMessages();
        this.otpSent = false;
    }

    getOTP(): void {
        if (this.mobile.length === 10) {
            this.loading = true;
            this.clearMessages();
            this.authService.loginWithOTP(this.mobile).pipe(first(), takeUntil(this.destroy$)).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.otpSent = true; // Show OTP input after success
                    this.otpSuccessMessage = 'OTP sent successfully';
                    console.log('OTP sent successfully:', response);
                }, error: (error) => {
                    this.loading = false;
                    this.otpSuccessMessage = '';
                    console.log(error);
                    if (error && error.error === 'MOBILE_NOT_FOUND') {
                        this.errorMessage = 'Mobile Number not found';
                    } else if (error && error.error === 'ACCOUNT_SUSPENDED') {
                        this.errorMessage = 'Account suspended';
                    } else {
                        this.errorMessage = 'Mobile Number not found';
                    }
                    console.error('API error:', this.errorMessage);
                },
            });
        } else {
            this.errorMessage = 'Please enter a valid 10-digit mobile number.';
        }
    }

    login(): void {
        if (this.otpSent && this.otp) {
            const otp = parseInt(this.otp);
            this.loading = true;
            this.clearMessages();
            this.authService.verifyOTP(this.mobile, otp).pipe(first(), takeUntil(this.destroy$)).subscribe({
                next: (response) => {
                    this.loading = false;
                    Swal.fire({
                        title: 'Success!',
                        text: 'Login successful. Redirecting to your dashboard.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                },
                error: (error) => {
                    this.loading = false;
                    this.errorMessage = 'Invalid OTP. Please try again.';
                },
            });
        } else {
            this.errorMessage = 'Please enter a valid OTP.';
        }
    }

    // Method to clear both success and error messages
    clearMessages(): void {
        this.errorMessage = '';
    }
}