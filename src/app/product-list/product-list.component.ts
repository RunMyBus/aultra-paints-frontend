import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2'; 
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent extends Unsubscribable implements OnInit {
   products: any[] = [];
  brands: any[] = [];  // <-- Added for brands
  totalBrands: number = 0;
  totalBrandPages: number = 1;

  currentProduct: any = { products: '', brandId: '' };
  searchQuery: string = '';  
  isSearching: boolean = false;  
  submitted = false; 
  errors: string[] = [];

  // Pagination variables
  currentPage: number = 1;
  totalPages: number = 1;
  totalProducts: number = 0;
  limit: number = 10;
  limitOptions: number[] = [10, 20, 50, 100]; 

  constructor(private apiService: ApiRequestService, private modalService: NgbModal) { super(); }
  @ViewChild('productForm', { static: false }) productForm!: NgForm;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apiService.getProducts({ page: this.currentPage, limit: this.limit }).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        this.products = data.products;  
        this.totalProducts = data.pagination.totalProducts; 
        this.totalPages = Math.ceil(this.totalProducts / this.limit);  
      },
      (error) => {
        console.error('Error loading products', error);
      }
    );
  }

  loadBrands(): void {
    const data = { page: 1, limit: 1000 }; 
    this.apiService.getAllBrands(data).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.brands = response.brands;
        this.totalBrands = response.pagination.totalBrands;
        this.totalBrandPages = response.pagination.totalPages;
      },
      error: () => {
        this.showError('Error fetching brands!');
      }
    });
  }

  searchProducts(): void {
    if (this.searchQuery.trim() === '') {
      this.loadProducts();  
      return;
    }

    this.isSearching = true;
    this.apiService.searchProductByName(this.searchQuery, this.currentPage, this.limit).pipe(takeUntil(this.destroy$)).subscribe(
      (data) => {
        if (data && data.data && data.data.length > 0) {
          this.products = data.data;  
          this.totalPages = data.pages;
          this.totalProducts = data.total;
        } else {
          this.products = [];
        }
        this.isSearching = false;
      },
      (error) => {
        this.products = [];
        this.isSearching = false;
      }
    );
  }

 addProduct(content: any): void {
  this.currentProduct = { products: '', brandId: '' };
  this.submitted = false;
  this.errors = [];
  this.loadBrands();
  this.modalService.open(content, { size: 'md' });
}

  saveProduct(modal: any): void {
    this.submitted = true; 
    this.errors = [];

    if (this.productForm.invalid || !this.currentProduct.brandId) {
  this.errors.push('Please fill in all required fields, including brand.');
  return;
}


    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const saveRequest = this.currentProduct._id
          ? this.apiService.updateProduct(this.currentProduct._id, this.currentProduct)
          : this.apiService.createProduct(this.currentProduct);

        saveRequest.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadProducts();  
            this.showSuccess(this.currentProduct._id ? 'Product updated successfully!' : 'Product added successfully!');
            this.modalService.dismissAll();  
          },
          error: (error) => {
            console.error('Error:', error);
            const errorMessage = error?.error || 'Something error occurred while saving the product';
            this.errors.push(errorMessage);
          }
        });
      }
    });
  }

 editProduct(product: any, content: any): void {
  this.currentProduct = { ...product };
  if (!this.currentProduct.brandId) this.currentProduct.brandId = '';
  this.submitted = false;
  this.errors = [];
  this.loadBrands();
  this.modalService.open(content, { size: 'md' });
}


  deleteProduct(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteProduct(id).pipe(takeUntil(this.destroy$)).subscribe(
          () => {
            this.loadProducts();
            Swal.fire('Deleted!', 'The product has been deleted.', 'success');
          },
          () => {
            this.showError('Error deleting product!');
          }
        );
      }
    });
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  handleLimitChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
    });
  }

  showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
  }
}