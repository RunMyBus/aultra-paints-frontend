import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { takeUntil } from 'rxjs';

import { ApiRequestService } from '../services/api-request.service';
import { ApiUrlsService } from '../services/api-urls.service';
import { Unsubscribable } from '../shared/unsubscribable';

@Component({
  selector: 'app-credit-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule, NgSelectModule],
  templateUrl: './credit-notes.component.html',
  styleUrls: [],
})
export class CreditNotesComponent extends Unsubscribable implements OnInit {
  @ViewChild('issueForm') issueForm!: NgForm;

  creditNotes: any[] = [];
  dealers: any[] = [];
  currentPage = 1;
  limit = 10;
  limitOptions = [5, 10, 20, 50];
  total = 0;
  isLoading = false;
  submitted = false;

  filters = { userId: '', balanceType: '', status: '', dateFrom: '', dateTo: '' };

  issueData = { userId: '', balanceType: 'rewardPoints', amount: null as number | null, narration: '' };
  selectedDealer: any = null;

  constructor(
    private apiRequestService: ApiRequestService,
    private apiUrls: ApiUrlsService,
    private modalService: NgbModal,
  ) { super(); }

  ngOnInit(): void {
    this.loadDealers();
    this.loadCreditNotes();
  }

  loadDealers(): void {
    this.apiRequestService.getAllDealers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => { this.dealers = res.data || []; },
        error: (err: any) => console.error('Error loading dealers:', err),
      });
  }

  loadCreditNotes(): void {
    this.isLoading = true;
    const payload: any = { page: this.currentPage, limit: this.limit };
    if (this.filters.userId)      payload.userId      = this.filters.userId;
    if (this.filters.balanceType) payload.balanceType = this.filters.balanceType;
    if (this.filters.status)      payload.status      = this.filters.status;
    if (this.filters.dateFrom)    payload.dateFrom    = this.filters.dateFrom;
    if (this.filters.dateTo)      payload.dateTo      = this.filters.dateTo;

    this.apiRequestService.listCreditNotes(payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.creditNotes = res.creditNotes || [];
        this.total = res.pagination?.total || 0;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading credit notes:', err);
        this.isLoading = false;
      },
    });
  }

  onDealerChange(): void {
    this.selectedDealer = this.dealers.find(d => d._id === this.issueData.userId) || null;
  }

  openIssueModal(template: any): void {
    this.submitted = false;
    this.issueData = { userId: '', balanceType: 'rewardPoints', amount: null, narration: '' };
    this.selectedDealer = null;
    this.loadDealers();                                    // refresh balances before every open
    this.modalService.open(template, { size: 'md' });
  }

  submitIssue(modalRef: NgbModalRef): void {
    this.submitted = true;
    if (!this.issueForm.valid) return;

    this.apiRequestService.issueCreditNote(this.issueData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        modalRef.close();
        Swal.fire('Success', 'Credit note issued successfully', 'success');
        this.loadCreditNotes();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Failed to issue credit note';
        Swal.fire('Error', msg, 'error');
      },
    });
  }

  downloadPDF(creditNoteNumber: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this.apiRequestService.downloadCreditNotePDF(creditNoteNumber).pipe(takeUntil(this.destroy$)).subscribe({
      next: (blob: Blob) => {
        const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `CreditNote-${creditNoteNumber}.pdf`;
          link.rel = 'noopener';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
      },
      error: () => Swal.fire('Error', 'Failed to download PDF', 'error'),
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadCreditNotes();
  }

  clearFilters(): void {
    this.filters = { userId: '', balanceType: '', status: '', dateFrom: '', dateTo: '' };
    this.currentPage = 1;
    this.loadCreditNotes();
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadCreditNotes();
  }

  handleLimitChange(): void {
    this.currentPage = 1;
    this.loadCreditNotes();
  }
}
