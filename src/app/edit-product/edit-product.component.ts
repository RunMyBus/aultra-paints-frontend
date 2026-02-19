import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestService } from '../services/api-request.service';
import { ApiUrlsService } from '../services/api-urls.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';


@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent {
  @ViewChild('productCatlogForm') productCatlogForm!: NgForm;

  currentCatlog: any = {
    productOfferDescription: '',
    productOfferStatus: 'Active',
    focusProductId: [],
    price: {},
    productOfferImageUrl: '',
    productOfferImage: null,
    _id: '',

  };

  priceList: Array<{ volume: string; entries: Array<{ selectedKey: string; price: number }> }> = [];
  errorArray: string[] = [];
  submitted = false;

  groupedDropdownData: Array<{ id: string; label: string; group?: string }> = [];
  focusProducts: any[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiRequestService: ApiRequestService,
    public apiUrls: ApiUrlsService
  ) {
    const nav = this.router.getCurrentNavigation();
    const navState = nav?.extras?.state;

    if (!navState || !navState['catlog']) {
      this.router.navigate(['/product-catlog']);
      return;
    }

    this.currentCatlog = {
      ...this.currentCatlog,
      ...navState['catlog']
    };


    // Convert price object to priceList for form editing
    if (this.currentCatlog.price && typeof this.currentCatlog.price === 'object') {
      this.initPriceList();
    }
  }

  ngOnInit(): void {
    if (this.priceList.length === 0) {
      // fallback init
      this.priceList.push({ volume: '', entries: [{ selectedKey: 'All', price: 0 }] });
    }
    this.initPriceList();
    this.loadGroupedDropdownData();
    this.loadFocusProducts();
  }

  loadFocusProducts() {
    this.apiRequestService.getFocusProducts().subscribe(
      (res: any) => {

        if (!res || res.success === false) {
          Swal.fire({
            icon: 'error',
            title: 'Focus API Error',
            text: res?.message || 'Failed to fetch entities from Focus',
            confirmButtonColor: '#d33',
            confirmButtonText: 'OK'
          });
          return;
        }

        this.focusProducts = (res.data || []).filter(
          (x: any) => x.iMasterId && x.sName
        );

        this.setSelectedProduct();
      },
      (error: any) => {
        console.error('Focus API Error:', error);

        Swal.fire({
          icon: 'error',
          title: 'Focus API Error',
          text: error?.error?.message || 'Failed to fetch entities from Focus',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });

        this.focusProducts = [];
      }
    );
  }


  setSelectedProduct() {

    if (!Array.isArray(this.currentCatlog.focusProductMapping)) return;

    const ids = this.currentCatlog.focusProductMapping.map(
      (m: any) => m.focusProductId
    );

    this.currentCatlog.focusProductId = ids;
  }


  onProductChange(productIds: number[]) {

    if (!productIds || productIds.length === 0) {
      this.currentCatlog.productOfferDescription = '';
      this.priceList = [];
      return;
    }

    const selectedProducts = this.focusProducts.filter(p =>
      productIds.includes(p.iMasterId)
    );

    let baseProductName = '';
    const extractedVolumes: string[] = [];

    selectedProducts.forEach(product => {

      const fullName = product.sName.trim();
      const volumeRegex = /(\d+(?:\.\d+)?(?:\/\d+)?\s?(?:ltr?s?|kg?s?|ml))/i;
      const match = fullName.match(volumeRegex);

      let cleanedName = fullName;

      if (match) {
        const volume = match[0]
          .replace(/\s/g, '')
          .toUpperCase()
          .replace('LTRS', 'LTR')
          .replace('KGS', 'KG');

        extractedVolumes.push(volume);
        cleanedName = fullName.replace(match[0], '').trim();
      }

      baseProductName = cleanedName;
    });

    this.currentCatlog.productOfferDescription = baseProductName;


    this.priceList = this.priceList.filter(v =>
      extractedVolumes.includes(v.volume)
    );


    extractedVolumes.forEach(volume => {

      const exists = this.priceList.find(v => v.volume === volume);

      if (!exists) {
        this.priceList.push({
          volume: volume,
          entries: [{ selectedKey: 'All', price: 1000 }]
        });
      }
    });
  }



  loadGroupedDropdownData() {
    Promise.all([
      this.apiRequestService.getStates().toPromise() as Promise<any>,
      this.apiRequestService.getZones().toPromise() as Promise<any>,
      this.apiRequestService.getDistricts().toPromise() as Promise<any>,
    ])
      .then(([states, zones, districts]) => {
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
      })
      .catch(error => {
        console.error('Error fetching grouped dropdown data:', error);
      });
  }

  initPriceList() {

    if (!Array.isArray(this.currentCatlog.price) || this.currentCatlog.price.length === 0) {
      this.priceList = [
        { volume: '', entries: [{ selectedKey: 'All', price: 0 }] }
      ];
      return;
    }

    const grouped: any = {};

    this.currentCatlog.price.forEach((item: any) => {

      if (!grouped[item.volume]) {
        grouped[item.volume] = {
          volume: item.volume,
          entries: []
        };
      }

      grouped[item.volume].entries.push({
        selectedKey: item.refId || 'All',
        price: item.price || 0
      });

    });

    this.priceList = Object.values(grouped);
  }



  addPrice() {
    this.priceList.push({ volume: '', entries: [{ selectedKey: 'All', price: 0 }] });
  }

  addEntryToVolume(index: number) {
    this.priceList[index].entries.push({ selectedKey: 'All', price: 0 });
  }

  removeEntryFromVolume(volumeIndex: number, entryIndex: number) {
    if (this.priceList[volumeIndex].entries.length > 1) {
      this.priceList[volumeIndex].entries.splice(entryIndex, 1);
    }
  }

  toggleStatus(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.currentCatlog.productOfferStatus = isChecked ? 'Active' : 'Inactive';
  }

  handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.currentCatlog.productOfferImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.currentCatlog.productOfferImageUrl = reader.result as string;
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

    if (!this.currentCatlog.focusProductId || this.currentCatlog.focusProductId.length === 0) {
      this.errorArray.push('Product name is required.');
    }

    if (!this.currentCatlog.productOfferImage && !this.currentCatlog.productOfferImageUrl) {
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

    if (this.productCatlogForm?.form) {
      Object.keys(this.productCatlogForm.form.controls).forEach(field => {
        const control = this.productCatlogForm.form.get(field);
        if (control) {
          control.markAsTouched({ onlySelf: true });
        }
      });
    }

    if (!this.validateForm()) return;

    this.currentCatlog.price = this.generatePricePayload();

    if (this.productCatlogForm.valid) {
      let oldDate = this.currentCatlog.productDescription;
      this.currentCatlog.productDescription = `${this.currentCatlog.productDescription}`;

      const focusProductMapping: any[] = [];

      this.priceList.forEach(volumeGroup => {

        const matchingProduct = this.focusProducts.find(p =>
          this.currentCatlog.focusProductId.includes(p.iMasterId) &&
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

      if (this.currentCatlog.productOfferImage) {
        formData.append('productImage', this.currentCatlog.productOfferImage);
      }

      formData.append('productImageUrl', this.currentCatlog.productOfferImageUrl || '');
      formData.append('productDescription', this.currentCatlog.productOfferDescription);
      formData.append('productStatus', this.currentCatlog.productOfferStatus);
      formData.append('price', JSON.stringify(this.currentCatlog.price));
      formData.append('focusProductMapping', JSON.stringify(focusProductMapping));


      this.apiRequestService
        .updateWithImage(this.apiUrls.updateProductCatlog + this.currentCatlog._id, formData)
        .subscribe(
          () => {
            Swal.fire('Success', 'Product catalog updated successfully', 'success');
            this.router.navigate(['/product-catalog']);
          },
          (error) => {
            console.error('Error updating product catalog:', error);
            this.errorArray = [];
            this.currentCatlog.productDescription = oldDate;
            if (error && error.message) {
              this.errorArray.push(error.message);
            } else {
              this.errorArray.push(error);
            }
          });
    }
  }

  cancel() {
    this.router.navigate(['/product-catalog']);
  }
}