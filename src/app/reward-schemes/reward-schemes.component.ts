import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {NgbAlertModule, NgbInputDatepicker, NgbModal, NgbModalRef, NgbPagination} from "@ng-bootstrap/ng-bootstrap";
import {ApiRequestService} from "../services/api-request.service";
import {ApiUrlsService} from "../services/api-urls.service";
import Swal from "sweetalert2";
import { Unsubscribable } from '../shared/unsubscribable';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-reward-schemes',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination, NgbAlertModule, NgbInputDatepicker],
  templateUrl: './reward-schemes.component.html',
  styleUrl: './reward-schemes.component.css'
})
export class RewardSchemesComponent extends Unsubscribable implements OnInit {
  rewardSchemes: any[] = [];
  currentRewardScheme: any = {
    rewardSchemeImageUrl: '',
    rewardSchemeStatus: ''
  };

  rewardSchemesQuery: any = {
    page: 1,
    limit: 10,
    searchQuery: ''
  };

  limitOptions: number[] = [10, 20, 50, 100];  
  limit: number = 10;  
  totalRewardSchemes: number = 0;  
  currentPage: number = 1;
  totalPages: number = 1;
  errorArray: Array<any> = [];
  timestamp: number = new Date().getTime();
  imageWidth: string = '20%';
  uploadImageWidth: string = '20%';

  constructor(private apiRequestService: ApiRequestService, private modalService: NgbModal, public apiUrls: ApiUrlsService) {
    super();
  }

  ngOnInit(): void {
    this.loadRewardSchemes();
  }

  loadRewardSchemes() {
    this.rewardSchemes = [];
    this.apiRequestService.create(this.apiUrls.searchRewardSchemes, this.rewardSchemesQuery).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
      this.rewardSchemes = response.data;
      this.totalRewardSchemes = response.pagination.totalSchemes;
      this.totalPages = response.pagination.totalPages;  // Ensure totalPages is set correctly
    }, (error) => {
      console.error('Error loading reward schemes', error);
    });
  }
  

  openAddEditModal(modal: any, rewardScheme: any) {
    this.errorArray = []; 
    if (rewardScheme._id) {
      // Editing an existing reward scheme
      this.currentRewardScheme = { ...rewardScheme };
    } else {
      // Adding a new reward scheme, reset rewardSchemeStatus to 'Active'
      this.currentRewardScheme = { rewardSchemeStatus: 'Active', rewardSchemeImageUrl: '', rewardSchemeImage: '' };
    }
    
    const modalRef: NgbModalRef = this.modalService.open(modal, { size: 'md' });
    modalRef.result.then(() => { this.currentRewardScheme = {}; }, () => { this.currentRewardScheme = {}; });
  }

  saveRewardScheme(modalRef: NgbModalRef) {
    const formData = new FormData();
    if (this.currentRewardScheme.rewardSchemeImage) {
      formData.append('rewardSchemeImage', this.currentRewardScheme.rewardSchemeImage);
    }
    if (this.currentRewardScheme.rewardSchemeImageUrl) {
      formData.append('rewardSchemeImageUrl', this.currentRewardScheme.rewardSchemeImageUrl);
    }
    formData.append('rewardSchemeStatus', this.currentRewardScheme.rewardSchemeStatus);
  
    const handleError = (error: { error: string; message: string; }) => {
      console.error('Error:', error);
      this.errorArray = [];

      // Check if error message is available and accessible
      if (error && error.error) {
        this.errorArray.push(error.error);

      } else if (error) {
        this.errorArray.push(error);
      }
    };
  
    if (this.currentRewardScheme._id) {
      this.apiRequestService.updateWithImage(this.apiUrls.updateRewardScheme + this.currentRewardScheme._id, formData).pipe(takeUntil(this.destroy$)).subscribe(
        (response) => {
          if (response) {
            modalRef.close();
            Swal.fire('Success', 'Reward scheme updated successfully', 'success');
            this.timestamp = new Date().getTime();
            this.currentRewardScheme = {};
            this.errorArray = [];
            this.loadRewardSchemes();
          }
        },
        (error) => handleError(error) // Use the error handler
      );
    } else {
      this.apiRequestService.createWithImage(this.apiUrls.createRewardScheme, formData).pipe(takeUntil(this.destroy$)).subscribe(
        (response) => {
          if (response) {
            modalRef.close();
            Swal.fire('Success', 'Reward scheme added successfully', 'success');
            this.timestamp = new Date().getTime();
            this.currentRewardScheme = {};
            this.errorArray = [];
            this.loadRewardSchemes();
          }
        },
        (error) => handleError(error) // Use the error handler
      );
    }
  }

  deleteRewardScheme(rewardSchemeId: string) {
    Swal.fire({
      title: 'Confirm Deletion',
      text: 'Are you sure you want to delete this reward scheme?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiRequestService.delete(this.apiUrls.deleteRewardScheme + rewardSchemeId).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.loadRewardSchemes();
            Swal.fire('Deleted!', 'The reward scheme has been successfully removed.', 'success');
          },
          error: (error) => Swal.fire('Error', error?.error?.message || 'Failed to delete reward scheme', 'error')
        });
      }
    });
  }
  

  handlePageChange(page: number) {
    this.rewardSchemesQuery.page = page;
    this.loadRewardSchemes();
  }

  handleLimitChange() {
    this.rewardSchemesQuery.page = 1; // Reset to page 1 when limit is changed
    this.loadRewardSchemes();
  }

  handleImageChange($event: Event) {
    const file = ($event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentRewardScheme.rewardSchemeImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }


  toggleRewardSchemeStatus(rewardScheme: any) {
    rewardScheme.rewardSchemeStatus = rewardScheme.rewardSchemeStatus === 'Active' ? 'Inactive' : 'Active';
    Swal.fire({
      title: `Are you sure you want to mark this reward scheme as ${rewardScheme.rewardSchemeStatus}?`,
      text: `You are about to mark this reward scheme as ${rewardScheme.rewardSchemeStatus}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, mark as ${rewardScheme.rewardSchemeStatus}`,
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiRequestService.update(this.apiUrls.updateRewardScheme + rewardScheme._id, rewardScheme).pipe(takeUntil(this.destroy$)).subscribe((response) => {
          if (response) {
            this.timestamp = new Date().getTime();
            this.loadRewardSchemes();
            Swal.fire('Status updated', 'Reward scheme status has been updated successfully', 'success');
          }
        })
      } else {
        rewardScheme.rewardSchemeStatus = rewardScheme.rewardSchemeStatus === 'Inactive'? 'Active' : 'Inactive';
      }
    });
  }

  formToggleRewardSchemeStatus(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.currentRewardScheme.rewardSchemeStatus = isChecked ? 'Active' : 'Inactive';

  }
}
