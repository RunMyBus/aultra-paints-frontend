import { Component } from '@angular/core';
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
export class OrderListComponent extends Unsubscribable {
  orders: any[] = [];
  currentPage: number = 1;
  limit: number = 10;
  totalOrders: number = 0;
  limitOptions: number[] = [5, 10, 20, 50];
  isLoading: boolean = false;

  constructor(private apiRequestService: ApiRequestService) { super(); }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.apiRequestService.getAllOrders(this.currentPage, this.limit).pipe(takeUntil(this.destroy$)).subscribe(
      (response) => {
        this.orders = response.orders;
        console.log(this.orders , '--------------')
        this.totalOrders = response.total;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching orders:', error);
        this.isLoading = false;
      }
    );
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  handleLimitChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }
}
