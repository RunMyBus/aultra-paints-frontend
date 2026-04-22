import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiRequestService } from '../services/api-request.service';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-transaction-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './transaction-ledger.component.html',
  styleUrls: ['./transaction-ledger.component.css']
})
export class TransactionLedgerComponent extends Unsubscribable {
  transactions: any[] = [];
  currentPage: number = 1;
  limit: number = 10;
  totalTransactions: number = 0;
  totalPages: number = 0;
  limitOptions: number[] = [5, 10, 20, 50];
  isLoading: boolean = false;

  constructor(private apiRequestService: ApiRequestService) { super(); }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.isLoading = true;

    const payload = { page: this.currentPage, limit: this.limit };

    this.apiRequestService.getTransactionLedger(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.transactions = response.transactions || [];
        this.totalTransactions = response.pagination?.totalTransactions || 0;
        this.totalPages = response.pagination?.totalPages || 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
        this.isLoading = false;
      }
    });
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadTransactions();
  }

  handleLimitChange(): void {
    this.currentPage = 1;
    this.loadTransactions();
  }


 downloadCreditNote(transactionId: string) {
  if (!transactionId) return;

  // 🔹 Find the selected transaction in the list
  const transaction = this.transactions.find(t => t._id === transactionId);

  // 🔹 Safely handle missing unique code
  const uniqueCode = transaction?.uniqueCode?.trim();
  const fileName = uniqueCode
    ? `CreditNote-${uniqueCode}.pdf`
    : `CreditNote.pdf`;

  // Guard for SSR: window/document are absent on the server.
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  this.apiRequestService.downloadTransactionLedgerPDF(transactionId).pipe(takeUntil(this.destroy$)).subscribe({
    next: (pdfBlob) => {
      // Build a blob URL and open it directly in a new tab — the browser's
      // native PDF viewer handles preview + download. No document.write, no
      // inline <script>, no popup template that can be XSS-abused.
      const blob = new Blob([pdfBlob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);

      const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      if (!opened) {
        // Popup blocked — fall back to a silent download.
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Revoke the URL after a delay so the opened tab has time to load.
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    },
    error: (err) => {
      console.error('Failed to preview or download PDF:', err);
      alert('Error generating Credit Note PDF');
    }
  });
}



}
