import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OrderService } from '../order.service';
import { FormsModule, NgForm } from '@angular/forms';
import {Router} from '@angular/router';
import {ApiUrlsService} from "../services/api-urls.service";
import {ApiRequestService} from "../services/api-request.service";
import { NgSelectComponent } from '@ng-select/ng-select';
import Swal from "sweetalert2";
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';


@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [FormsModule, CommonModule, NgSelectComponent, NgbPagination],
  templateUrl: './batch-list.component.html',
  styleUrl: './batch-list.component.css'
})
export class BatchListComponent extends Unsubscribable {
branches: any[] = [];
currentPage = 1;
totalBranches = 0;
limit = 10;  // Default page size
limitOptions = [10, 20, 50, 100];  // Available page size options
    searchQuery: string = '';
    showUpdateModal = false;
    selectedBranch: any = {
        id: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        products: {},
        brands: {}
    };
   brands: any = []; 
    productData: any = [];
    volumes: string[] = ['10 LT', '20 LT', '30 LT', '50 LT', '100 LT'];

    constructor(private orderService: OrderService,
                private router: Router,
                private ApiUrls: ApiUrlsService,
                private apiRequest: ApiRequestService) {
        super();
    }

  ngOnInit(): void {
    this.loadBranches();
    this.apiRequest.getAll(this.ApiUrls.getAllBrands).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.brands = response;
    });
}



    // Method to load branches with pagination
  loadBranches(page: number = this.currentPage, limit: number = this.limit): void {
    this.apiRequest.post(this.ApiUrls.getBatches, { page, limit, searchQuery: this.searchQuery }).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.branches = response.branches;
      this.totalBranches = response.total; 
    }, (error) => {
      console.error('Error loading branches:', error);
    });
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.branches); // Export the branches (batches) data
    const workbook: XLSX.WorkBook = { Sheets: { 'Batches': worksheet }, SheetNames: ['Batches'] };
    
    // Trigger the download of the Excel file
    XLSX.writeFile(workbook, 'batches.xlsx');
  }
  

      onSearch(): void {
        if (this.searchQuery.trim() !== '') {
          this.apiRequest.searchBranch(this.ApiUrls.searchBranch, this.searchQuery).pipe(takeUntil(this.destroy$)).subscribe(
            (response) => {
              this.branches = [response];
              this.totalBranches = 1;
              this.currentPage = 1;
            },
            (error) => {
              console.error('Error searching branch:', error);
              this.branches = [];
              this.totalBranches = 0;
              this.currentPage = 1;
            }
          );
        } else {
          this.loadBranches();
        }
      }

    onCreateBatch(): void {
        this.router.navigate(['/create-batch']);
    }

    // Handle page size change
  handleLimitChange(): void {
    this.currentPage = 1; 
    this.loadBranches(this.currentPage, this.limit); 
  }

  // Handle page change (when user clicks on a different page)
  handlePageChange(page: number): void {
    this.currentPage = page; 
    this.loadBranches(page, this.limit); 
  }

    onUpdate(branch: any): void {
        this.selectedBranch = {...branch};
        this.selectedBranch.CreationDate = new Date(branch.CreationDate)
        this.selectedBranch.ExpiryDate = new Date(branch.ExpiryDate)
       this.getProducts();
        this.showUpdateModal = true;
    }

    // In list.component.ts

    onUpdateSubmit(form: NgForm): void {
        // Check if the form is invalid
        if (form.invalid) {
            // No need for Swal here, as Angular already shows validation errors inline below each field.
            return;
        }
    
        // Form is valid, show the confirmation Swal for updating the batch
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to update this batch?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Proceed with updating the batch
                this.apiRequest.update(this.ApiUrls.updateBatch + this.selectedBranch._id, this.selectedBranch).pipe(takeUntil(this.destroy$)).subscribe(
                    (response) => {
                        this.loadBranches(); // Reload the branches list
                        this.closeUpdateModal(); // Close the modal
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Batches updated'
                        });
                    },
                    (error) => {
                        console.error('Error updating batch:', error);
                        // Optionally, you can handle errors here and show a message
                    }
                );
            }
        });
    }
    

    onDelete(id: string): void {
        this.apiRequest.getCouponSeries(this.ApiUrls.branchDeletedAffectedCouponsCount + id).pipe(takeUntil(this.destroy$)).subscribe((response) => {
            console.log(response)
            let text = response.message;
            Swal.fire({
                title: 'Are you sure?',
                html: `${response.message} <br>  You won\'t be able to revert this!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.apiRequest.delete(this.ApiUrls.deleteBatch + id).pipe(takeUntil(this.destroy$)).subscribe((response) => {
                        this.loadBranches();
                    }, (error) => {
                        console.error('Error deleting branch:', error);
                    });
                }
            });
        }, (error) => {
            console.error(error);
        });
    }

    // Method to close the update modal
    closeUpdateModal(): void {
        this.showUpdateModal = false; // Hide the modal
    }
   
   getProducts(): void {
    this.apiRequest.getAll(this.ApiUrls.getAllProducts).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        this.productData = response;
    });
}


   
}

