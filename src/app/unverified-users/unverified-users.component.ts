import { Component } from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-unverified-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './unverified-users.component.html',
  styleUrl: './unverified-users.component.css'
})
export class UnverifiedUsersComponent extends Unsubscribable {
  unverifiedUsers: any[] = [];
  totalUsers: number = 0;
  totalPages: number = 0;
  currentPage: number = 1;
  limit: number = 10;  
  searchQuery: string = '';
  limitOptions: number[] = [10, 20, 50, 100]; 
  currentUser: any = {};  // To store the current user being edited
  errorsEditUser: any[] = [];  // To store errors for the edit form
  submitted: boolean = false;  // To track form submission status

  constructor(private apiRequestService: ApiRequestService, private router: Router,  private modalService: NgbModal) { super(); }

  ngOnInit(): void {
    this.fetchUnverifiedUsers(); 
  }

  // Method to fetch users with searchQuery, page, and limit
  fetchUnverifiedUsers(page: number = 1, limit: number = 10, searchQuery: string = ''): void {
    console.log('Fetching users with search query:', searchQuery);  // Debugging line
    this.apiRequestService.getUnverifiedUsers(page, limit, searchQuery).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.unverifiedUsers = response.data;
        this.totalUsers = response.total;
        this.totalPages = response.pages;
        this.currentPage = response.currentPage;
        console.log('Fetched data:', response); 
      },
      error: (error) => {
        console.error('Error fetching unverified users', error);
      }
    });
  }

  exportUsers(): void {
  this.apiRequestService.exportUnverifiedUsers().pipe(takeUntil(this.destroy$)).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'unverified-users.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    },
    error: (error) => {
      console.error('Error exporting unverified users:', error);
      Swal.fire('Error', 'Failed to export unverified users.', 'error');
    }
  });
}


   // Open the modal to edit a user
   openEditModal(user: any, content: any): void {
    this.errorsEditUser = [];
    this.currentUser = { ...user };  // Populate currentUser with the selected user's details
    this.modalService.open(content, { size: 'lg' });  // Open the modal
  }

  // Update user method (similar to the one in your original code)
  updateUser(modal: any, userForm: any): void {
    this.submitted = true;

    if (userForm.valid) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to save these changes?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          // Update user via API
          this.apiRequestService.updateUser(this.currentUser._id, this.currentUser).pipe(takeUntil(this.destroy$)).subscribe(
            () => {
              this.fetchUnverifiedUsers(this.currentPage, this.limit, this.searchQuery);
              Swal.fire('User updated successfully!', '', 'success');
              modal.close();  // Close modal
            },
            (error) => {
              if (error?.errors && error.errors.length > 0) {
                this.errorsEditUser = error.errors;
              } else {
                Swal.fire('Error', 'Error updating user!', 'error');
              }
            }
          );
        }
      });
    }
  }

  // Method triggered when page size is changed
  handleLimitChange(): void {
    this.fetchUnverifiedUsers(this.currentPage, this.limit, this.searchQuery);
  }

  // Method triggered when page changes
  handlePageChange(page: number): void {
    this.currentPage = page;
    this.fetchUnverifiedUsers(this.currentPage, this.limit, this.searchQuery);
  }

  // Method triggered on search input change
  searchUnverifiedUsers(): void {
    console.log('Search query changed:', this.searchQuery);  
    this.fetchUnverifiedUsers(this.currentPage, this.limit, this.searchQuery);
  }

  showRedeemedPoints(_id: any) {
    this.router.navigate(['/transactions'], { queryParams: { userId: _id } });
  }
}