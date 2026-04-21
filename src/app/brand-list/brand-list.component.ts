import { Component, ViewChild } from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2'; 
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-brand-list',
  standalone: true,
  imports: [FormsModule, CommonModule, NgbPagination],
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.css']
})
export class BrandListComponent extends Unsubscribable {
 brands: any[] = [];
  searchQuery: string = '';
  currentBrand: any = { name: '' };
  errorMessage: string = '';
  isSearching: boolean = false;
  submitted = false;
  errors: string[] = [];

  // Pagination variables
  currentPage: number = 1;
  totalPages: number = 1;
  totalBrands: number = 0;
  limit: number = 10;
  limitOptions: number[] = [10, 20, 50, 100]; 

  constructor(
    private apiRequestService: ApiRequestService,
    private modalService: NgbModal
  ) { super(); }

  @ViewChild('brandForm', { static: false }) brandForm!: NgForm;

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    const data = { page: this.currentPage, limit: this.limit };
    this.apiRequestService.getAllBrands(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.brands = response.brands;
        this.totalBrands = response.pagination.totalBrands;
        this.totalPages = response.pagination.totalPages;
      },
      error: () => {
        this.showError('Error fetching brands!');
      }
    });
  }

  searchBrands(): void {
    if (this.searchQuery.trim() === '') {
      this.loadBrands();
      return;
    }

    this.isSearching = true;
    this.apiRequestService.searchBrandsByName(this.searchQuery, this.currentPage, this.limit).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.brands = response.data;
          this.totalBrands = response.total;
          this.totalPages = response.pages;
        } else {
          this.brands = [];
        }
      },
      error: (error) => {
        console.error('Error searching brands:', error);
        this.brands = [];
      }
    });
  }

  addBrand(content: any): void {
    this.currentBrand = { name: '' };
    this.submitted = false;
    this.errors = [];
    this.modalService.open(content, { size: 'md' });
  }

  editBrand(brand: any, content: any): void {
    this.currentBrand = { ...brand };
    this.submitted = false;
    this.errors = [];
    this.modalService.open(content, { size: 'md' });
  }

  brandExists(brandName: string): boolean {
    return this.brands.some(brand => brand.name.toLowerCase() === brandName.toLowerCase());
  }

  saveBrand(Modal: any): void {
    this.submitted = true;
    this.errors = [];

    if (this.brandForm.invalid) {
      this.errors.push('Please fill in all required fields.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this brand?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const saveRequest = this.currentBrand._id
          ? this.apiRequestService.updateBrand(this.currentBrand._id, this.currentBrand)
          : this.apiRequestService.createBrand(this.currentBrand);

        saveRequest.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadBrands();
            this.showSuccess(this.currentBrand._id ? 'Brand updated successfully!' : 'Brand added successfully!');
            this.modalService.dismissAll();
          },
          error: (error) => {
            console.error('Error:', error);
            const errorMessage = error?.error || error?.message || 'Something error occurred while saving the brand';
            this.errors.push(errorMessage);
          }
        });
      }
    });
  }

  deleteBrand(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiRequestService.deleteBrand(id).pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.loadBrands();
          Swal.fire('Deleted!', 'Your brand has been deleted.', 'success');
        }, () => {
          this.showError('Error deleting brand!');
        });
      }
    });
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadBrands();
  }

  handleLimitChange(): void {
    this.currentPage = 1;
    this.loadBrands();
  }

  showSuccess(message: string): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
    });
  }

  showError(message: string): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
  }
}