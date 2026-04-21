import { Component, HostListener} from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-product-data-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination],
  templateUrl: './product-data-list.component.html',
  styleUrl: './product-data-list.component.css'
})
export class ProductDataListComponent extends Unsubscribable {

  statisticsList: any[] = [];
  currentPage = 1;
  limit = 10;
  totalItems = 0;
  limitOptions = [10, 25, 50, 100];
  selectedBranches: string[] = [];
  allBranches: string[] = [];
  dropdownOpen = false;

  constructor(private apiService: ApiRequestService) { super(); }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    const requestPayload = {
      page: this.currentPage,
      limit: this.limit,
      branches: this.selectedBranches
    };

    this.apiService.getBatchStatisticsList(requestPayload).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.statisticsList = res.data || [];
      this.totalItems = res.pagination?.total || this.statisticsList.length;

      if (res.branches?.length && this.allBranches.length === 0) {
        this.allBranches = res.branches;
      }
    });
  }

  handlePageChange(page: number): void {
    this.currentPage = page;
    this.fetchData();
  }

  handleLimitChange(): void {
    this.currentPage = 1;
    this.fetchData();
  }

exportBatchStatistics(): void {
  const requestPayload = {
    branches: this.selectedBranches
  };

  this.apiService.exportBatchStatistics(requestPayload).pipe(takeUntil(this.destroy$)).subscribe((response: Blob) => {
    const blob = new Blob([response], { type: 'text/csv;charset=utf-8;' }); 

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BatchStatistics.csv'; 
    a.click();
    window.URL.revokeObjectURL(url);
  }, error => {
    console.error('Export failed:', error);
  });
}


  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onBranchChange(): void {
    this.currentPage = 1;
    this.fetchData();
  }

  isSelected(branch: string): boolean {
    return this.selectedBranches.includes(branch);
  }

  toggleSelection(branch: string): void {
    const index = this.selectedBranches.indexOf(branch);
    if (index === -1) {
      this.selectedBranches.push(branch);
    } else {
      this.selectedBranches.splice(index, 1);
    }
    this.onBranchChange();
  }

  selectAllToggle(): void {
  if (this.selectedBranches.length === this.allBranches.length) {
    this.selectedBranches = [];
  } else {
    this.selectedBranches = [...this.allBranches];
  }
  this.onBranchChange();
}


  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const clickedInside = target.closest('.position-relative');
    if (!clickedInside) {
      this.dropdownOpen = false;
    }
  }
}
