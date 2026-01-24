import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlsService {

  constructor() { }

  // Use dynamic URL from environment file
  mainUrl = environment.apiUrl;

  // Users API URLs
  getUsers = 'users/all';
  addUser = 'users/add';
  updateUser = 'users';
  deleteUser = 'users';
  searchUser = 'users/searchUser';
  toggleUserStatus = 'users/toggle-status';
  resetPassword = 'users/resetPassword';
  userDashboard = 'users/userDashboard';
  exportUsers = 'users/export';
  exportUnverifiedUsers = 'users/export-unverified';

 
   // Sales Executives endpoint
   SalesExecutives = 'users/sales-executives';

   //api urls for unverifed users
   getUnverifiedUsers = 'users/unverified-users';

  // API Urls
  register = 'auth/register';

  // batchApiUrls
  createBatch = 'batchNumbers/add';
  getBatches = 'batchNumbers';
  searchBranch = 'batchNumbers/';
  couponSeries = 'batchNumbers/couponSeries';
  updateBatch = 'batchNumbers/update/';
  deleteBatch = 'batchNumbers/delete/';
  branchDeletedAffectedCouponsCount = 'batchNumbers/branchDeletedAffectedCouponsCount/';

  // Transactions
  getTransactions = 'transaction';
  exportTransaction = 'transaction/export';
  batchTimeline = 'chart/batch-timeline';
  batchStatisticsList = 'chart/batch-statistics-list';
  exportBatchStatistics = 'chart/export-batch-statistics';


  //transaction ledger
  getTransactionLedger = 'transactionLedger/getTransactions';
  updateTransactionLedger = 'transactionLedger/updateTransaction/'; 
  downloadTransactionLedgerPDF = 'transactionLedger/credit-note/';

//cashFree
getcashfreetransaction = 'cashFree/getTransactions';
getCashFreeBalance = 'cashFree/fetchBulkPeBalance';


  // Product URLs
  createProduct = 'products';
  getProducts = 'products';
  getAllProducts = 'products/getAllProducts';
  getProductByName = 'products/search'; 
  getAllProductsForSelect = 'products/getAllProductsForSelect/';
  updateProduct = 'products';
  deleteProduct = 'products';

  // API Urls for Brands
  createBrand = 'brands';
  getBrands = 'brands';
  getAllBrands = 'brands/getAllBrands';
  getBrandsByProductId = 'brands';
  updateBrand = 'brands';
  deleteBrand = 'brands';
  searchBrandsByName = 'brands/search';

  // API Urls for Product Offers
  createProductOffer = 'productOffers/create';
  searchProductOffers = 'productOffers/searchProductOffers';
  getProductOffers = 'productOffers/getProductOffers';
  getProductOfferById = 'productOffers/getProductOfferById/';
  updateProductOffer = 'productOffers/update/';
  deleteProductOffer = 'productOffers/delete/';

  // API Urls for Reward Schemes
  createRewardScheme = 'rewardSchemes/create';
  searchRewardSchemes = 'rewardSchemes/searchRewardSchemes';
  getRewardSchemes = 'rewardSchemes/getRewardSchemes';
  getRewardSchemeById = 'rewardSchemes/getRewardSchemeById/';
  updateRewardScheme = 'rewardSchemes/update/';
  deleteRewardScheme = 'rewardSchemes/delete/';



//Api urls for states
getStates = 'states/all'; 

//api urls for zones
getZones = 'zones/all';

//api urls for districts
getDistricts = 'districts/all';


// Product Category API URLs
createProductCatlog = 'productCatlog/create';
getProductCatlog = 'productCatlog';
searchProductCatlog = 'productCatlog/search';
updateProductCatlog = 'productCatlog/update/'; 
deleteProductCatlog = 'productCatlog/delete/'; 

// Focus Product / Unit APIs
getFocusProducts = 'products/focus-products';
getFocusEntities = 'products/focus-entities';

//order
checkoutUrl = 'order/create';
getAllOrders = '/order/orders';

//piechartsdashboard
batchStatistics = 'chart/batch-statistics';



}
