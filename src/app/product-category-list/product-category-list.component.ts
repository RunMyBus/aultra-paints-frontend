import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-category-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './product-category-list.component.html',
  styleUrl: './product-category-list.component.css'
})
export class ProductCategoryListComponent extends Unsubscribable implements OnInit {
  @ViewChild('categoryForm') categoryForm!: NgForm;

  categories: any[] = [];
  currentCategory: any = { name: '', categoryId: '' };
  submitted = false;
  errors: string[] = [];

  constructor(
    private apiRequestService: ApiRequestService,
    private modalService: NgbModal
  ) { super(); }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiRequestService.getProductCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.categories = response.data || [];
      },
      error: () => {
        this.showError('Error fetching product categories!');
      }
    });
  }

  openAdd(content: any): void {
    this.currentCategory = { name: '', categoryId: '' };
    this.submitted = false;
    this.errors = [];
    this.modalService.open(content, { size: 'md' });
  }

  openEdit(category: any, content: any): void {
    this.currentCategory = { ...category };
    this.submitted = false;
    this.errors = [];
    this.modalService.open(content, { size: 'md' });
  }

  save(modal: any): void {
    this.submitted = true;
    this.errors = [];

    if (this.categoryForm.invalid) {
      this.errors.push('Please fill in all required fields.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save this product category?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const request = this.currentCategory._id
          ? this.apiRequestService.updateProductCategoryMaster(this.currentCategory._id, this.currentCategory)
          : this.apiRequestService.createProductCategoryMaster(this.currentCategory);

        request.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadCategories();
            this.showSuccess(this.currentCategory._id ? 'Category updated successfully!' : 'Category added successfully!');
            modal.close();
          },
          error: (error: any) => {
            const msg = error?.error?.message || error?.message || 'Something went wrong while saving.';
            this.errors.push(msg);
          }
        });
      }
    });
  }

  delete(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiRequestService.deleteProductCategoryMaster(id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadCategories();
            Swal.fire('Deleted!', 'Product category has been deleted.', 'success');
          },
          error: () => {
            this.showError('Error deleting product category!');
          }
        });
      }
    });
  }

  showSuccess(message: string): Promise<any> {
    return Swal.fire({ icon: 'success', title: 'Success', text: message });
  }

  showError(message: string): Promise<any> {
    return Swal.fire({ icon: 'error', title: 'Error', text: message });
  }
}
