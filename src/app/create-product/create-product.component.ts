import { Component, ViewChild } from '@angular/core';
import { ApiRequestService } from '../services/api-request.service';
import { ApiUrlsService } from '../services/api-urls.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  providers: [DatePipe],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.css'
})
export class CreateProductComponent {

  @ViewChild('productCatlogForm') productCatlogForm!: NgForm;
  @ViewChild('fileInput') fileInput: any;


  currentCatlog: any = {
    productImage: '',
    productImageUrl: '',
    productDescription: '',
    productStatus: 'Active',
    focusProductIds: [],
    price: ''
  };

  priceList: Array<{ volume: string, entries: Array<{ selectedKey: string, price: number }> }> = [
    { volume: '', entries: [{ selectedKey: 'All', price: 1000 }] }
  ];

  errorArray: string[] = [];
  submitted = false;
  groupedDropdownData: any[] = [];

  currentUser: any = {};

  focusProducts: any[] = [];
  focusEntities: any[] = [];


  constructor(
    private apiRequestService: ApiRequestService,
    public apiUrls: ApiUrlsService,
    private datePipe: DatePipe,
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.getAllStatesZonesAndDistricts();
    this.loadFocusDropdowns();
  }

 loadFocusDropdowns() {
  this.apiRequestService.getFocusProducts().subscribe(
    (res: any) => {

      if (!res.success) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: res.message || 'Failed to fetch Focus Products',
          showConfirmButton: false,
          timer: 3000
        });
        return;
      }

      this.focusProducts = (res.data || []).filter(
        (x: any) => x.iMasterId && x.sName
      );
    },
    (error: any) => {
      console.error('Focus API Error:', error);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: error?.error?.message || 'Failed to fetch entities from Focus',
        showConfirmButton: false,
        timer: 3000
      });

      this.focusProducts = [];
    }
  );
}


  getAllStatesZonesAndDistricts() {
    Promise.all([
      this.apiRequestService.getStates().toPromise(),
      this.apiRequestService.getZones().toPromise(),
      this.apiRequestService.getDistricts().toPromise()
    ]).then(([states, zones, districts]: any) => {
      this.groupedDropdownData = [
        { id: 'All', label: 'All' },
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
    }).catch(error => {
      console.error('Error fetching dropdown data:', error);
    });
  }

  addPrice() {
    this.priceList.push({ volume: '', entries: [{ selectedKey: 'All', price: 1000 }] });
  }


  addEntryToVolume(volumeIndex: number) {
    this.priceList[volumeIndex].entries.push({ selectedKey: 'All', price: 0 });
  }

  removeEntryFromVolume(volumeIndex: number, entryIndex: number) {
    this.priceList[volumeIndex].entries.splice(entryIndex, 1);
  }


  handleImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.currentCatlog.productImage = reader.result as string;
      };
      reader.readAsDataURL(file);
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

  validateForm(): boolean {
    this.errorArray = [];

    if (!this.currentCatlog.focusProductIds || this.currentCatlog.focusProductIds.length === 0) {
      this.errorArray.push('Product name is required.');
    }

    if (!this.currentCatlog.productImage && !this.currentCatlog.productImageUrl) {
      this.errorArray.push('Product image is required.');
    }

    if (this.priceList.length === 0) {
      this.errorArray.push('At least one volume and price entry is required.');
    } else {
      this.priceList.forEach((volumeGroup, i) => {
        if (!volumeGroup.volume) {
          this.errorArray.push(`Volume is required for group ${i + 1}`);
        }
        volumeGroup.entries.forEach((entry, j) => {
          if (!entry.selectedKey) {
            this.errorArray.push(`Place selection is required for entry ${j + 1} in group ${i + 1}`);
          }
          if (entry.price === null || entry.price === undefined || entry.price <= 0) {
            this.errorArray.push(`Valid price is required for entry ${j + 1} in group ${i + 1}`);
          }
        });
      });
    }

    return this.errorArray.length === 0;
  }

  saveCatlog() {
    this.submitted = true;

    if (!this.validateForm()) return;

    this.currentCatlog.price = this.generatePricePayload();

    let oldDate = this.currentCatlog.productDescription;
    this.currentCatlog.productDescription = `${this.currentCatlog.productDescription}`;

    const focusProductMapping: any[] = [];

    this.priceList.forEach(volumeGroup => {

      const matchingProduct = this.focusProducts.find(p =>
        this.currentCatlog.focusProductIds.includes(p.iMasterId) &&
        p.sName.replace(/\s/g, '').toUpperCase()
          .includes(volumeGroup.volume.replace(/\s/g, '').toUpperCase())

      );

      if (matchingProduct) {
        focusProductMapping.push({
          volume: volumeGroup.volume,
          focusProductId: matchingProduct.iMasterId,
          focusUnitId: 1
        });
      }
    });

    const formData = new FormData();
    if (this.currentCatlog.productImage) {
      // if your API accepts file uploads as Blob
      formData.append('productImage', this.currentCatlog.productImage);
    }
    if (this.currentCatlog.productImageUrl) {
      formData.append('productImageUrl', this.currentCatlog.productImageUrl);
    }
    formData.append('productDescription', this.currentCatlog.productDescription);
    formData.append('productStatus', this.currentCatlog.productStatus);
    formData.append('price', JSON.stringify(this.currentCatlog.price));
    formData.append('focusProductMapping', JSON.stringify(focusProductMapping));



    this.apiRequestService
      .createWithImage(this.apiUrls.createProductCatlog, formData)
      .subscribe(
        () => {
          Swal.fire('Success', 'Product catalog added successfully', 'success');
          this.resetForm();
        },
        (error) => {
          console.error('Error creating product catalog:', error);
          this.currentCatlog.productDescription = oldDate;
          this.errorArray = [];
          if (error && error.message) {
            this.errorArray.push(error.message);
          } else {
            this.errorArray.push(error);
          }
        });
  }

  trackByIndex(index: number): number {
  return index;
}

  resetForm() {
    this.currentCatlog = {
      productImage: '',
      productImageUrl: '',
      productDescription: '',
      productStatus: 'Active',
      focusProductIds: [],
      price: ''
    };

    this.priceList = [
      { volume: '', entries: [{ selectedKey: 'All', price: 1000 }] }
    ];

    this.submitted = false;
    this.errorArray = [];

    if (this.productCatlogForm) {
      this.productCatlogForm.resetForm();
    }

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  toggleStatus(event: any) {
    this.currentCatlog.productStatus = event.target.checked ? 'Active' : 'Inactive';
  }

  cancel() {
    this.router.navigate(['/product-catalog']);
  }

  onProductChange(productIds: number[]) {

    if (!productIds || productIds.length === 0) {
      this.priceList = [{ volume: '', entries: [{ selectedKey: 'All', price: 1000 }] }];
      return;
    }

    const selectedProducts = this.focusProducts.filter(p =>
      productIds.includes(p.iMasterId)
    );

    const newPriceList: any[] = [];
    let baseProductName = '';

    selectedProducts.forEach(product => {

      const fullName = product.sName.trim();

      const volumeRegex = /(\d+\s?(LTRS?|L|KG|ML))/i;
      const match = fullName.match(volumeRegex);

      let extractedVolume = '';
      let cleanedName = fullName;

      if (match) {
        extractedVolume = match[0].replace(/\s/g, '').toUpperCase();
        cleanedName = fullName.replace(match[0], '').trim();
      }

      baseProductName = cleanedName;

      if (extractedVolume) {
        newPriceList.push({
          volume: extractedVolume,
          entries: [{ selectedKey: 'All', price: 1000 }]
        });
      }
    });

    this.currentCatlog.productDescription = baseProductName;
   this.priceList.length = 0;
this.priceList.push(...newPriceList);

  }



}
