import { Component, OnInit } from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent extends Unsubscribable implements OnInit {
  orders: any[] = [];
  currentPage = 1;
  limit = 10;
  totalOrders = 0;
  limitOptions = [5, 10, 20, 50];
  isLoading = false;
  expandedOrderId: string | null = null;
  statusFilter = '';
  isRetrying: { [key: string]: boolean } = {};
  retryMessage: { [key: string]: string } = {};

  readonly statusOptions = ['PENDING', 'VERIFIED', 'REJECTED', 'DISPATCHED', 'IN-PARCEL'];

  constructor(private apiRequestService: ApiRequestService) { super(); }

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.isLoading = true;
    this.apiRequestService.getAllOrders(this.currentPage, this.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.orders = response.orders;
          this.totalOrders = response.total;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  get filteredOrders(): any[] {
    if (!this.statusFilter) return this.orders;
    return this.orders.filter(o => o.status === this.statusFilter);
  }

  toggleExpand(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'VERIFIED':   return 'bg-primary';
      case 'PENDING':    return 'bg-warning text-dark';
      case 'REJECTED':   return 'bg-danger';
      case 'DISPATCHED': return 'bg-success';
      case 'IN-PARCEL':  return 'bg-info text-dark';
      default:           return 'bg-secondary';
    }
  }

  getFocusBadgeClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'SUCCESS': return 'bg-success';
      case 'FAILED':  return 'bg-danger';
      default:        return 'bg-warning text-dark';
    }
  }

  retryFocusSync(event: Event, order: any): void {
    event.stopPropagation();
    if (this.isRetrying[order.orderId]) return;
    this.isRetrying[order.orderId] = true;
    this.retryMessage[order.orderId] = '';
    this.apiRequestService.retryFocusSync(order.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          order.focusSyncStatus = 'PENDING';
          this.retryMessage[order.orderId] = 'Retry initiated';
          this.isRetrying[order.orderId] = false;
        },
        error: (err: any) => {
          this.retryMessage[order.orderId] = err?.error?.message || 'Retry failed';
          this.isRetrying[order.orderId] = false;
        }
      });
  }

  itemSubtotal(item: any): number {
    return (item.productPrice || 0) * (item.quantity || 0);
  }

  setStatusFilter(s: string): void {
    this.statusFilter = s;
    this.expandedOrderId = null;
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.expandedOrderId = null;
    this.loadOrders();
  }

  handleLimitChange(): void {
    this.currentPage = 1;
    this.expandedOrderId = null;
    this.loadOrders();
  }
}
