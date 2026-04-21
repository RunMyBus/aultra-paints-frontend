import {Component, OnInit} from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { OrderService } from "../order.service";
import { Router } from "@angular/router";
import { ApiUrlsService } from "../services/api-urls.service";
import { ApiRequestService } from "../services/api-request.service";
import {NgbModal, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import { ChangeDetectorRef } from '@angular/core';
import * as XLSX from 'xlsx';  // Import XLSX library
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'app-transactions',
    standalone: true,
    imports: [
        DatePipe,
        FormsModule,
        NgForOf,
        NgIf,
        NgClass,
        NgOptimizedImage,
        CommonModule,
        FormsModule,
        NgbPagination
    ],
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent extends Unsubscribable implements OnInit {
    currentPage = 1;
    totalPages = 1;
    limit = 10;
    transactions: any = [];
    qrUrl: any;
    showUpdateModal: boolean = false;
    showFilterModal: boolean = false;
    userId: string | null = '';
    limitOptions: Array<any> = [10, 20, 50, 100];
    searchQuery: string = ''; 
      // Filter variables
  filterPointsRedeemedBy: string = '';
  filterCashRedeemedBy: string = '';
  filterCouponCode: string = '';
  showUsedCoupons: boolean = false;
  salesExecutives: any[] = [];  
  selectedSalesExecutive: string = ''; 
  
  toastMessage: string = '';
  showToast: boolean = false;
  
    constructor(private orderService: OrderService,
                private router: Router,
                private ApiUrls: ApiUrlsService,
                private modalService: NgbModal,
                private cdr: ChangeDetectorRef,
                private apiRequest: ApiRequestService) { super(); }

    ngOnInit(): void {
        this.filterBasedOnUser();
        this.loadSalesExecutives();
    }


    applyFilters() {
        this.getAllTransactions(); 
        this.cdr.detectChanges();
        this.closeFilterModal(); 
      }

    getAllTransactions(page: number = this.currentPage) {
        this.apiRequest.create(this.ApiUrls.getTransactions, {
          page: page,
          limit: this.limit,
          userId: this.userId,
          searchKey: this.searchQuery,
          pointsRedeemedBy: this.filterPointsRedeemedBy,
          cashRedeemedBy: this.filterCashRedeemedBy,
          couponCode: this.filterCouponCode,
          showUsedCoupons: this.showUsedCoupons,
          salesExecutiveMobile: this.selectedSalesExecutive
        }).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            this.transactions = response.transactionsData;
            this.totalPages = Math.ceil(response.total / this.limit);
            console.log('Fetched transactions:', response);
          },
          (error: any) => {
            console.error('Error loading transactions:', error);
            const errorMsg = error?.error?.error || error?.error || 'An unexpected error occurred';
            this.showErrorToast(errorMsg); 
          }
        );
      }

      loadSalesExecutives() {
        this.apiRequest.getAllSalesExecutives().pipe(takeUntil(this.destroy$)).subscribe({
          next: (response: any) => {
            this.salesExecutives = response.data;
            console.log('Sales Executives loaded:', this.salesExecutives);
          },
          error: (error) => {
            console.error('Error loading sales executives:', error);
          }
        });
      }

      exportToExcel(): void {
        this.apiRequest.exportTransaction().pipe(takeUntil(this.destroy$)).subscribe({
          next: (blob: Blob) => {
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = 'transactions.csv';  // use .csv extension here
            a.click();
      
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
          },
          error: (error) => {
            console.error('Export failed:', error);
            const errorMsg = error?.error?.error || error?.message || 'Export failed. Try again.';
            this.showErrorToast(errorMsg);
          }
        });
      }
      
      
       // Function to reset the filter form fields
  resetFilterForm() {
    this.filterPointsRedeemedBy = '';
    this.filterCashRedeemedBy = '';
    this.filterCouponCode = '';
  }
    
      openFilterModal() {
        this.resetFilterForm();
        this.showFilterModal = true;  // Open the modal
      }
    
      closeFilterModal() {
        this.showFilterModal = false;  // Close the modal
      }

    setQrUrl(qr_code: any) {
        this.showUpdateModal = true;
        this.qrUrl = qr_code;
    }

    closeUpdateModal(): void {
        this.showUpdateModal = false; // Hide the modal
    }

    filterBasedOnUser() {
        const urlParams = new URLSearchParams(this.router.url.split('?')[1]);
        this.userId = urlParams.get('userId');
        this.getAllTransactions();
    }

    onReset() {
      this.userId = null;  
      this.searchQuery = ''; 
      this.filterPointsRedeemedBy = '';  
      this.filterCashRedeemedBy = '';  
      this.filterCouponCode = '';  
  
      // Call getAllTransactions to fetch all transactions without filters
      this.getAllTransactions();
      this.router.navigate(['/transactions']); 
  }
  

    handlePageChange($event: number) {
        this.currentPage = $event;
        this.getAllTransactions();
    }

    handleLimitChange() {
        this.currentPage = 1;
        this.getAllTransactions();
    }

    showErrorToast(message: string) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => this.hideToast(), 3000);
    }
  
    hideToast() {
      this.showToast = false;
    }
}
