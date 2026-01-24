import { Component, ViewChild } from '@angular/core';
import { ApiRequestService } from "../services/api-request.service";
import { NgSelectModule } from '@ng-select/ng-select';
import {
  NgbAlertModule,
  NgbDateStruct,
  NgbInputDatepicker,
  NgbModal,
  NgbModalRef,
  NgbPagination
} from "@ng-bootstrap/ng-bootstrap";
import Swal from "sweetalert2";
import { ApiUrlsService } from "../services/api-urls.service";
import { FormsModule, NgForm } from "@angular/forms";
import { CommonModule, DatePipe } from "@angular/common";
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-catlog',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPagination, NgbAlertModule, NgbInputDatepicker, NgSelectModule],
  templateUrl: './product-catlog.component.html',
  styleUrl: './product-catlog.component.css',
  providers: [DatePipe]
})
export class ProductCatlogComponent {
     @ViewChild('productCatlogForm') productCatlogForm!: NgForm;
     @ViewChild('addToCartModal') addToCartModal!:NgForm;
    productCatlogs: any[] = [];
    currentUser: any = {};
    currentCatlog: any = {
      productImageUrl: '',
      productDescription: '',
      productStatus: 'Active',
      price: ''
    };
  
    productCatlogsQuery: any = {
      page: 1,
      limit: 10,
      searchQuery: ''
    };
  
    limitOptions: number[] = [10, 20, 50, 100];
    limit: number = 10;
    totalProductCatlogs: number = 0;
    currentPage: number = 1;
    totalPages: number = 1;
    uploadImageWidth: string = '20%';
    imageWidth: string = '20%';
    errorArray: Array<any> = [];
    timestamp: number = new Date().getTime();
    submitted = false;
    groupedDropdownData: any[] = [];
   cart: { [id: string]: { count: number, price: number, volume: string , productId: string; } } = {};
    stateList: Array<{ stateName: string; stateId: string }> = [];
    zoneList: Array<{ zoneName: string; zoneId: string }> = [];
    districtList: Array<{ districtName: string; districtId: string }> = [];
     selectedProduct: any = null;
     volumeOptions: { label: string; value: string; price: number }[] = [];
selectedVolume: { label: string; value: string; price: number } | null = null;
selectedPrice: number = 0;


priceValue: number | null = null;
priceList: Array<{ volume: string, entries: Array<{ selectedKey: string, price: number }> }> = [
  { volume: '10 L', entries: [{ selectedKey: 'All', price: 0 }] }
];
 
focusEntities: any[] = [];
selectedEntityId: number | null = null;

  
    constructor(private apiRequestService: ApiRequestService, private modalService: NgbModal, public apiUrls: ApiUrlsService, private datePipe: DatePipe,private AuthService:AuthService, private router: Router ) {    this.currentUser = this.AuthService.currentUserValue;
    }
  
    ngOnInit(): void {
      this.loadProductCatlogs();
      this.getAllStatesZonesAndDistricts();
       this.loadFocusEntities();
    }
  
    loadFocusEntities() {
  this.apiRequestService.getFocusEntities().subscribe(res => {
    this.focusEntities = res.data || [];
  });
}

    loadProductCatlogs() {
      this.productCatlogs = [];
      this.apiRequestService.create(this.apiUrls.searchProductCatlog, this.productCatlogsQuery).subscribe((response: any) => {
        this.productCatlogs = response.data;
        this.totalProductCatlogs = response.total;
        this.totalPages = Math.ceil(this.totalProductCatlogs / this.productCatlogsQuery.limit);
      });
    }
  
    getAllStatesZonesAndDistricts() {
      Promise.all([
        this.apiRequestService.getStates().toPromise() as Promise<any>,
        this.apiRequestService.getZones().toPromise() as Promise<any>,
        this.apiRequestService.getDistricts().toPromise() as Promise<any>,
      ])
        .then(([states, zones, districts]) => {
          // Prepare grouped data for ng-select
          this.groupedDropdownData = [
            { id: 'All', label: 'All', },
            ...states.data.map((state: any) => ({
              id: state.stateId,
              label: state.stateName,
              group: 'States',
            })),
            ...zones.data.map((zone: any) => ({
              id: zone.zoneId,
              label: zone.zoneName,
              group: 'Zones',
            })),
            ...districts.data.map((district: any) => ({
              id: district.districtId,
              label: district.districtName,
              group: 'Districts',
            })),
          ];
        })
        .catch((error) => {
          console.error('Error fetching dropdown data:', error);
        });
    }

    onCreateProduct(): void {
  this.router.navigate(['/create-product']);
}
  
 addPrice() {
  this.priceList.push({ volume: '', entries: [{ selectedKey: 'All', price: 0 }] });
}

  getProductById(id: string) {
  const baseId = id.split('_')[0]; // Extract product ID before the underscore
  return this.productCatlogs.find(p => p._id === baseId);
}

    
    // Add a new entry to an existing volume
addEntryToVolume(index: number) {
  this.priceList[index].entries.push({ selectedKey: 'All', price: 1000});
}

onVolumeChange(selected: any) {
  this.selectedVolume = selected;
  this.selectedPrice = selected?.price || 0;
}


openAddToCartModal(product: any) {
  this.selectedProduct = product;

  this.volumeOptions = product.productPrices.map((item: any) => ({
    label: item.volume,
    value: item.volume,
    price: item.price
  }));

  if (this.volumeOptions.length > 0) {
    this.selectedVolume = this.volumeOptions[0];
    this.selectedPrice = this.selectedVolume.price;
  } else {
    this.selectedVolume = null;
    this.selectedPrice = 0;
  }

  this.modalService.open(this.addToCartModal, { ariaLabelledBy: 'modal-basic-title' });
}


 updatePrice() {
  if (this.selectedVolume !== null) {
    this.selectedPrice = this.selectedVolume.price;
  } else {
    this.selectedPrice = 0;
  }
}

get sortedVolumeOptions() {
  return this.volumeOptions.slice().sort((a, b) => {
    const getNumber = (label: string) => {
      const match = label.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    return getNumber(a.label) - getNumber(b.label);
  });
}



confirmAddToCart() {
  const baseId = this.selectedProduct._id;
  const volume = this.selectedVolume?.label || '';
  const id = `${baseId}_${volume}`; // Make the ID unique by combining product ID and volume

  if (!this.cart[id]) {
    this.cart[id] = {
      count: 1,
      price: this.selectedPrice,
      volume,
      productId: baseId 
    };
  } else {
    this.cart[id].count += 1;
  }

  this.modalService.dismissAll();

  Swal.fire({
    title: 'Added',
    text: 'Product added to cart',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    timerProgressBar: true
  });
}

getPriceByVolume(product: any, volume: string): number {
  const match = product.productPrices.find((p: any) => p.volume === volume);
  return match ? match.price : 0;
}

updateCart(product: any, volume: string, change: number) {
  const id = `${product._id}_${volume}`;

  if (!this.cart[id]) {
    this.cart[id] = {
      count: 0,
      price: product.productPrices?.find((p: any) => p.volume === volume)?.price || 0,
      volume,
       productId: product._id 
    };
  }

  this.cart[id].count += change;

  if (this.cart[id].count <= 0) {
    delete this.cart[id];
  }
}



    
  
    cartKeys(): string[] {
      return Object.keys(this.cart);
    }
  
    get cartItemCount(): number {
      return Object.values(this.cart).reduce((sum, item) => sum + item.count, 0);
    }
  
    openCartModal(modal: any) {
      this.modalService.open(modal, { size: 'md' });
    }


   addOrEditCatlog(modal: any, catlog: any) {
  if (catlog && catlog._id) {
    this.router.navigate(['/edit-product'], {
      state: { catlog }
    });
  } else {
    this.router.navigate(['/create-product']);
  }
}

 generatePricePayload() {
    const result: { [volume: string]: Array<{ [refId: string]: number }> } = {};
    for (const item of this.priceList) {
      if (!item.volume || !item.entries) continue;
      result[item.volume] = item.entries
        .filter(entry => entry.selectedKey && entry.price !== null && !isNaN(entry.price))
        .map(entry => ({ [entry.selectedKey]: entry.price }));
    }
    return result;
  }


    getCartTotalPrice(): number {
      let total = 0;
      for (const id of Object.keys(this.cart)) {
        const item = this.cart[id];
        total += item.price * item.count;
      }
      return total;
    }

  
    deleteCatlog(catlogId: string, productDescription: string) {
      Swal.fire({
        title: 'Confirm Deletion',
        text: `You want to delete the catalog: "${productDescription}".`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
      }).then((result) => {
        if (result.isConfirmed) {
          this.apiRequestService.delete(this.apiUrls.deleteProductCatlog + catlogId).subscribe({
            next: () => {
              this.loadProductCatlogs();
              Swal.fire('Catlog Deleted!', 'The catlog has been successfully removed.', 'success');
            },
            error: (error) => Swal.fire('Error', error?.error?.message || 'Failed to delete catlog', 'error')
          });
        }
      });
    }
  
    handlePageChange(page: number) {
      this.productCatlogsQuery.page = page;
      this.loadProductCatlogs();
    }
  
    handleLimitChange() {
      this.productCatlogsQuery.limit = this.limit;
      this.productCatlogsQuery.page = 1;
      this.loadProductCatlogs();
    }
  
    editCatlog(catlog: any, productModal: any) {
      this.addOrEditCatlog(productModal, catlog);
    }
  
    handleImageChange($event: Event) {
      const file = ($event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.currentCatlog.productImage = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  
  
  
    statusChanged(event: Event): void {
      const isChecked = (event.target as HTMLInputElement).checked;
      this.currentCatlog.productStatus = isChecked ? 'Active' : 'Inactive';
      console.log('Status changed', this.currentCatlog.productStatus);
    }

   
    toggleProductCatlogStatus(catlog: any): void {
      const newStatus = catlog.productOfferStatus === 'Active' ? 'Inactive' : 'Active';
    
      Swal.fire({
        title: `Are you sure you want to mark this product catalog as ${newStatus}?`,
        text: `You are about to mark this product catalog as ${newStatus}.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: `Yes, mark as ${newStatus}`,
        cancelButtonText: 'No, keep it',
      }).then((result) => {
        if (result.isConfirmed) {
          let priceArray: { [key: string]: number }[] = [];
          if (Array.isArray(catlog.price)) {
            priceArray = catlog.price.map((item: { refId?: string; price?: number } | { [key: string]: number }) => {
              if ('refId' in item && 'price' in item && item.refId && item.price !== undefined) {
                return { [item.refId]: item.price };
              }
              return item as { [key: string]: number };
            });
          }
    
          const updateData = {
            productImageUrl: catlog.productOfferImageUrl || catlog.productImageUrl,
            productDescription: catlog.productOfferDescription || catlog.productDescription,
            productStatus: newStatus,
            price: priceArray
          };
    
          this.apiRequestService.update(this.apiUrls.updateProductCatlog + catlog._id, updateData).subscribe({
            next: (response) => {
              if (response) {
                this.timestamp = new Date().getTime();
                catlog.productOfferStatus = newStatus;
                this.loadProductCatlogs();
                Swal.fire('Status updated', 'Product catalog status has been updated successfully', 'success');
              }
            },
            error: () => {
              Swal.fire('Error', 'Failed to update product catalog status', 'error');
            }
          });
        }
      });
    }
    

    proceedToCheckout() {
      const items = Object.keys(this.cart).map(id => {
         const cartItem = this.cart[id]; 
        const product = this.getProductById(id);
        const count = this.cart[id].count;
        const price = this.cart[id].price;
    
        return {
          _id: cartItem.productId,          
         volume: cartItem.volume,
          productOfferDescription: product?.productOfferDescription || product?.productDescription || '',
          productPrice: price,
          quantity: count,
          subtotal: price * count
        };
      });
    
      const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
    
      const orderPayload = {
        entityId: this.selectedEntityId,
        items,
        totalPrice
      };
    
      this.apiRequestService.createOrder(orderPayload).subscribe({
        next: (response) => {
          Swal.fire('Order Placed', 'Your order was placed successfully!', 'success');
          this.cart = {};
          this.modalService.dismissAll();
        },
        error: (err) => {
          const errorMessage = err?.message || err?.error?.message || 'Failed to place order';
          Swal.fire('Error', errorMessage, 'error');
        }
      });
    }
    
  }
  

