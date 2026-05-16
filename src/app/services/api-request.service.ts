import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpRequest} from "@angular/common/http";
import {ApiUrlsService} from "./api-urls.service";
import {map, Observable} from "rxjs";
import {Branch} from "../order.service";

@Injectable({
    providedIn: 'root'
})
export class ApiRequestService {

    constructor(private http: HttpClient, private ApiUrls: ApiUrlsService) {
    }

    create(subUrl: any, data: any) {
        return this.http.post(this.ApiUrls.mainUrl + subUrl, data).pipe(map((res: any) => {
            return res;
        }));
    }

    post(subUrl: any, data: any) {
        return this.http.post(this.ApiUrls.mainUrl + subUrl, data).pipe(map((res: any) => {
            return res;
        }));
    }

    createWithImage(subUrl: any, formData: FormData): Observable<any> {
        return this.http.post(this.ApiUrls.mainUrl + subUrl, formData);
    }

    updateWithImage(subUrl: any, formData: FormData): Observable<any> {
        return this.http.put(this.ApiUrls.mainUrl + subUrl, formData);
    }

    get(subUrl: any, data: any) {
        const params = new HttpParams()
            .set('page', data.page.toString())
            .set('limit', data.limit.toString());
        return this.http.get(this.ApiUrls.mainUrl + subUrl, {params}).pipe(map((res: any) => {
            return res;
        }));
    }

    searchBranch(subUrl: any, batchNumber: any) {
        return this.http.get<any>(this.ApiUrls.mainUrl + subUrl + '/' + batchNumber).pipe(map((res: any) => {
            return res;
        }));
    }

    getCouponSeries(subUrl: any) {
        return this.http.get<any>(this.ApiUrls.mainUrl + subUrl).pipe(map((res: any) => {
            return res;
        }));
    }

     // Toggle the user status (active/inactive)
  toggleUserStatus(userId: string, action: string) {
    return this.http.put(this.ApiUrls.mainUrl + this.ApiUrls.toggleUserStatus + `/${userId}`, {}).pipe(map((res: any) => {
      return res;
    }));
  }



    // Create a new product
    createProduct(data: any) {
        return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.createProduct, data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    // Get all products with pagination
    getProducts(data: any): Observable<any> {
        const params = new HttpParams()
            .set('page', data.page.toString())
            .set('limit', data.limit.toString());

        return this.http.get<any>(this.ApiUrls.mainUrl + this.ApiUrls.getProducts, {params});
    }

    // Search for a product by name
    searchProductByName(name: string, page: number = 1, limit: number = 10) {
        return this.http.get(`${this.ApiUrls.mainUrl}${this.ApiUrls.getProductByName}/${name}?page=${page}&limit=${limit}`).pipe(
          map((res: any) => res)
        );
      }

    // Update a product by its ID
    updateProduct(id: string, data: any) {
        return this.http.put(this.ApiUrls.mainUrl + this.ApiUrls.updateProduct + '/' + id, data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    // Delete a product by its ID
    deleteProduct(id: string) {
        return this.http.delete(this.ApiUrls.mainUrl + this.ApiUrls.deleteProduct + '/' + id).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    // Create a new brand
    createBrand(data: any) {
        return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.createBrand, data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    // Get all brands
    getAllBrands(data: any): Observable<any> {
        const params = new HttpParams()
            .set('page', data.page.toString())
            .set('limit', data.limit.toString());

        return this.http.get(this.ApiUrls.mainUrl + this.ApiUrls.getBrands, {params});
    }

    // Get brands by Product ID
    getBrandsByProductId(proId: string) {
        return this.http.get(this.ApiUrls.mainUrl + this.ApiUrls.getBrandsByProductId + '/' + proId).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    // Search for brands by name
    searchBrandsByName(name: string, page: number = 1, limit: number = 10): Observable<any> {
        return this.http.get(`${this.ApiUrls.mainUrl}/${this.ApiUrls.searchBrandsByName}/${name}?page=${page}&limit=${limit}`).pipe(
          map((res: any) => res)
        );
      }
      
      

    // Update a brand
    updateBrand(id: string, data: any) {
        return this.http.put(this.ApiUrls.mainUrl + this.ApiUrls.updateBrand + '/' + id, data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    // Delete a brand
    deleteBrand(id: string) {
        return this.http.delete(this.ApiUrls.mainUrl + this.ApiUrls.deleteBrand + '/' + id).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    getAll(subUrl: any) {
        return this.http.get(this.ApiUrls.mainUrl + subUrl).pipe(map((res: any) => {
            return res;
        }));
    }

    update(subUrl: string, body: any) {
        let url = this.ApiUrls.mainUrl + subUrl
        console.log(url)
        return this.http.put(url, body).pipe(map((res: any) => {
            return res;
        }));
    }

    // Get all users
    getUsers(page: number, limit: number, searchQuery: any, accountType: string) {
        let query = {
            page: page,
            limit: limit,
            searchQuery: searchQuery,
            accountType: accountType // Include accountType in the query
        };
        
        return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.searchUser, query).pipe(
            map((res: any) => res)
        );
    }
    

    // Add a new user
    addUser(user: any) {
        return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.addUser, user).pipe(
            map((res: any) => res)
        );
    }

    // Update an existing user
    updateUser(id: string, user: any) {
        return this.http.put(this.ApiUrls.mainUrl + this.ApiUrls.updateUser + '/' + id, user).pipe(
            map((res: any) => res)
        );
    }

    // Delete a user by ID
    deleteUser(id: string) {
        return this.http.delete(this.ApiUrls.mainUrl + this.ApiUrls.deleteUser + '/' + id).pipe(
            map((res: any) => res)
        );
    }

    delete(subUrl: string) {
        return this.http.delete(this.ApiUrls.mainUrl + subUrl).pipe(map((res: any) => res));
    }

    getUnverifiedUsers(page: number = 1, limit: number = 10, searchQuery: string = ''): Observable<any> {
        const body = {
          page: page,
          limit: limit,
          searchQuery: searchQuery
        };
    
        return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.getUnverifiedUsers, body);
      }
      
   // ** CashFree API Method **
   getCashFreeTransactions(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
        .set('page', page.toString())
        .set('limit', limit.toString());

    return this.http.get(this.ApiUrls.mainUrl + 'cashFree/getTransactions', { params }).pipe(
        map((res: any) => res)
    );
}



 // All active dealers for dropdowns (no pagination cap)
 getAllDealers(): Observable<any> {
   return this.http.get(this.ApiUrls.mainUrl + this.ApiUrls.getAllDealers).pipe(
     map((res: any) => res)
   );
 }

 // Method to get all sales executives
 getAllSalesExecutives(): Observable<any> {
    return this.http.get(this.ApiUrls.mainUrl + this.ApiUrls.SalesExecutives).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  // Junior SEs reporting to the currently logged-in Senior SE
  getJuniorSalesExecutives(): Observable<any> {
    return this.http.get(`${this.ApiUrls.mainUrl}users/junior-sales-executives`);
  }
  


   // Method to get state names
   getStates(): Observable<string[]> {
    const url = `${this.ApiUrls.mainUrl}/${this.ApiUrls.getStates}`;
    return this.http.get<string[]>(url);
  }
  
  getZones(): Observable<any> {
    const url = `${this.ApiUrls.mainUrl}/${this.ApiUrls.getZones}`;
    return this.http.get(url);
  }

  getDistricts(): Observable<any> {
    const url = `${this.ApiUrls.mainUrl}/${this.ApiUrls.getDistricts}`;
    return this.http.get(url);
  }

  // Create a new product category
createProductCatlog(data: any) {
    return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.createProductCatlog, data).pipe(
        map((res: any) => {
            return res;
        })
    );
}

// Get all product categories with pagination
getProductCatlogs(data: any): Observable<any> {
    const params = new HttpParams()
        .set('page', data.page.toString())
        .set('limit', data.limit.toString());

    return this.http.get<any>(this.ApiUrls.mainUrl + this.ApiUrls.getProductCatlog, { params });
}

// Search for a product category by name
searchProductCatelogByName(name: string, page: number = 1, limit: number = 10) {
    return this.http.get(`${this.ApiUrls.mainUrl}${this.ApiUrls.searchProductCatlog}/${name}?page=${page}&limit=${limit}`).pipe(
        map((res: any) => res)
    );
}

// Update a product category by its ID
updateProductCatlog(id: string, data: any) {
    return this.http.put(this.ApiUrls.mainUrl + this.ApiUrls.updateProductCatlog + '/' + id, data).pipe(
        map((res: any) => {
            return res;
        })
    );
}

// Delete a product category by its ID
deleteProductCategory(id: string) {
    return this.http.delete(this.ApiUrls.mainUrl + this.ApiUrls.deleteProductCatlog + '/' + id).pipe(
        map((res: any) => {
            return res;
        })
    );
}

// Product Category Master APIs
getProductCategories(): Observable<any> {
    return this.http.get(this.ApiUrls.mainUrl + this.ApiUrls.getProductCategories).pipe(
        map((res: any) => res)
    );
}

createProductCategoryMaster(data: any): Observable<any> {
    return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.createProductCategory, data).pipe(
        map((res: any) => res)
    );
}

updateProductCategoryMaster(id: string, data: any): Observable<any> {
    return this.http.put(this.ApiUrls.mainUrl + this.ApiUrls.updateProductCategory + id, data).pipe(
        map((res: any) => res)
    );
}

deleteProductCategoryMaster(id: string): Observable<any> {
    return this.http.delete(this.ApiUrls.mainUrl + this.ApiUrls.deleteProductCategory + id).pipe(
        map((res: any) => res)
    );
}

// Create a new order
createOrder(data: any): Observable<any> {
    return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.checkoutUrl, data).pipe(
      map((res: any) => {
        return res;
      })
    );
  }


  getAllOrders(
    page: number,
    limit: number,
    filters?: { status?: string; dealerCode?: string; salesExecutiveMobile?: string }
  ) {
    const body: any = { page, limit };
    if (filters?.status) body.status = filters.status;
    if (filters?.dealerCode) body.dealerCode = filters.dealerCode;
    if (filters?.salesExecutiveMobile) body.salesExecutiveMobile = filters.salesExecutiveMobile;
    return this.http
      .post(this.ApiUrls.mainUrl + this.ApiUrls.getAllOrders, body)
      .pipe(map((res: any) => res));
  }

  getOrderDealers() {
    return this.http
      .get<{ success: boolean; dealers: { _id: string; dealerCode: string; name: string }[] }>(
        this.ApiUrls.mainUrl + this.ApiUrls.getOrderDealersUrl
      )
      .pipe(map((res) => res.dealers || []));
  }

  exportTransaction(): Observable<Blob> {
    return this.http.post(
      this.ApiUrls.mainUrl + this.ApiUrls.exportTransaction,
      {}, 
      { responseType: 'blob' } 
    );
  }



  getBatchStatistics(): Observable<any> {
    return this.http.get(this.ApiUrls.mainUrl + this.ApiUrls.batchStatistics, {})
      .pipe(map((res: any) => res));
  }
  
  getBatchTimeline(batchId: string) {
    const params = new HttpParams().set('batchId', batchId);
    return this.http.get<any>(this.ApiUrls.mainUrl + this.ApiUrls.batchTimeline, { params }).pipe(
      map(res => res)  
    );
  }

  getBatchStatisticsList(data: any): Observable<any> {
  return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.batchStatisticsList, data).pipe(
    map((res: any) => {
      return res;
    })
  );
}

  exportBatchStatistics(data: any) {
  return this.http.post(
    this.ApiUrls.mainUrl + this.ApiUrls.exportBatchStatistics,
    data,
    {
      responseType: 'blob'  
    }
  );
}

exportUsers(data: any): Observable<Blob> {
  return this.http.post(
    this.ApiUrls.mainUrl + this.ApiUrls.exportUsers,
    data,
    {
      responseType: 'blob'  
    }
  );
}

exportUnverifiedUsers(): Observable<Blob> {
  return this.http.get(
    this.ApiUrls.mainUrl + this.ApiUrls.exportUnverifiedUsers,
    {
      responseType: 'blob'
    }
  );
}


getTransactionLedger(data: any) {
  return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.getTransactionLedger, data)
    .pipe(map((res: any) => res));
}


//  Update Transaction Ledger record
updateTransactionLedger(id: string, data: any) {
  return this.http.put(this.ApiUrls.mainUrl + this.ApiUrls.updateTransactionLedger + id, data).pipe(
    map((res: any) => {
      return res;
    })
  );
}


downloadTransactionLedgerPDF(transactionId: string): Observable<Blob> {
  const url = this.ApiUrls.mainUrl + this.ApiUrls.downloadTransactionLedgerPDF + transactionId;
  return this.http.get(url, {
    responseType: 'blob',
  });
}

issueCreditNote(data: any): Observable<any> {
  return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.issueCreditNote, data)
    .pipe(map((res: any) => res));
}

listCreditNotes(data: any): Observable<any> {
  return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.listCreditNotes, data)
    .pipe(map((res: any) => res));
}

downloadCreditNotePDF(creditNoteNumber: string): Observable<Blob> {
  return this.http.get(
    this.ApiUrls.mainUrl + this.ApiUrls.downloadCreditNotePDF + creditNoteNumber,
    { responseType: 'blob' }
  );
}


getCashFreeBalance() {
  return this.http.get(this.ApiUrls.mainUrl + this.ApiUrls.getCashFreeBalance).pipe(
    map((res: any) => res)
  );
}


getFocusProducts(): Observable<any> {
  return this.http
    .get(this.ApiUrls.mainUrl + this.ApiUrls.getFocusProducts)
    .pipe(map((res: any) => res));
}

getFocusEntities(): Observable<any> {
  return this.http
    .get(this.ApiUrls.mainUrl + this.ApiUrls.getFocusEntities)
    .pipe(map((res: any) => res));
}

getFocusWarehouses(): Observable<any> {
  return this.http
    .get(this.ApiUrls.mainUrl + this.ApiUrls.getFocusWarehouses)
    .pipe(map((res: any) => res));
}

getFocusBranches(): Observable<any> {
  return this.http
    .get(this.ApiUrls.mainUrl + this.ApiUrls.getFocusBranches)
    .pipe(map((res: any) => res));
}

retryFocusSync(orderId: string): Observable<any> {
  return this.http.post(this.ApiUrls.mainUrl + this.ApiUrls.retryFocusSync, { orderId })
    .pipe(map((res: any) => res));
}

}



