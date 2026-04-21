import { Component } from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx'; // Import XLSX library
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-payouts',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination],
  templateUrl: './payouts.component.html',
  styleUrl: './payouts.component.css'
})
export class PayoutsComponent extends Unsubscribable {
  cashFreeTransactions: any[] = []; // Store the fetched transactions
  limit: number = 10; // Default page size
  currentPage: number = 1; // Default current page
  totalTransactions: number = 0; // Total number of transactions
  limitOptions: number[] = [5, 20, 50, 100]; // Limit options for page size


   availableBalance: number = 0;

   toastMessage: string = '';
  showToast: boolean = false;


  constructor( private apiRequestService: ApiRequestService,) { super(); }

  ngOnInit(): void {
      this.loadBalance();
    this.loadTransactions(); // Load transactions on component init
  }

  // Method to fetch CashFree transactions with pagination
  loadTransactions(page: number = 1, limit: number = 10): void {
    this.apiRequestService.getCashFreeTransactions(page, limit).pipe(takeUntil(this.destroy$)).subscribe(
      (response) => {
        this.cashFreeTransactions = response.cashFreeTransactions;
        this.totalTransactions = response.pagination.totalTransactions;
      },
      (error) => {
        console.error('Error fetching transactions:', error);
      }
    );
  }

  // Method to export transactions to Excel
  exportToExcel(): void {
    if (this.cashFreeTransactions && this.cashFreeTransactions.length > 0) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.cashFreeTransactions);
        const wb: XLSX.WorkBook = XLSX.utils.book_new(); // Create a new workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Payouts'); // Append the sheet to the workbook
        // Trigger the download of the Excel file
        XLSX.writeFile(wb, 'payouts.xlsx');
    }


  }



   //  Load available balance
  loadBalance(): void {
    this.apiRequestService.getCashFreeBalance().pipe(takeUntil(this.destroy$)).subscribe(
      (response) => {
        if (response.success) {
          this.availableBalance = response.availableBalance;
        } else {
          this.availableBalance = 0;
          this.showErrorToast(response.message || 'Error fetching available balance from BulkPe');
        }
      },
      (error) => {
        console.error('Error fetching available balance:', error);
        this.availableBalance = 0;
        this.showErrorToast('Unable to fetch available balance');
      }
    );
  }

  // Handle page change from pagination controls
  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions(page, this.limit); 
  }

  // Handle page size change from the selector
  handleLimitChange(): void {
    this.loadTransactions(this.currentPage, this.limit); 
  }

   //  Toast functions (
  showErrorToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.hideToast(), 3000);
  }

  hideToast() {
    this.showToast = false;
  }
}
