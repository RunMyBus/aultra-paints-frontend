import {Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {RegisterComponent} from './register/register.component';
import {TransactionsComponent} from "./transactions/transactions.component";
import {AuthGuard} from "./guards/auth.guard";
import {NoAuthGuard} from "./guards/no-auth.guard";
import {RoleGuard} from "./guards/role.guard";
import { ProductListComponent } from './product-list/product-list.component';
import { BrandListComponent } from './brand-list/brand-list.component';
import { UserListComponent } from './user-list/user-list.component';
import { BatchListComponent } from './batch-list/batch-list.component';
import { CreateBatchComponent } from './create-batch/create-batch.component';
import {LayoutComponent} from "./layout/layout.component";
import {PrivacyPolicyComponent} from "./privacy-policy/privacy-policy.component";
import {RewardSchemesComponent} from "./reward-schemes/reward-schemes.component";
import {ProductOffersComponent} from "./product-offers/product-offers.component";
import { UnverifiedUsersComponent } from './unverified-users/unverified-users.component';
import { PayoutsComponent } from './payouts/payouts.component';
import { ProductCatlogComponent } from './product-catlog/product-catlog.component';
import { OrderListComponent } from './order-list/order-list.component';
import { PiechartdashboardComponent } from './piechartdashboard/piechartdashboard.component';
import { ProductDataListComponent } from './product-data-list/product-data-list.component';
import { CreateProductComponent } from './create-product/create-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { TransactionLedgerComponent } from './transaction-ledger/transaction-ledger.component';
import { CreditNotesComponent } from './credit-notes/credit-notes.component';
import { ProductCategoryListComponent } from './product-category-list/product-category-list.component';

const ADMIN = ['SuperUser'];
const STAFF = ['SuperUser', 'SalesExecutive'];

export const routes: Routes = [
    {path: 'login', component: LoginComponent, canActivate: [NoAuthGuard]},
    {path: 'register', component: RegisterComponent},
    {path: 'privacy-policy', component: PrivacyPolicyComponent},
    {
        path: '', component: LayoutComponent, canActivate: [AuthGuard],
        children: [
            {path: '', component: DashboardComponent},
            {path: 'dashboard', component: DashboardComponent},
            {path: 'batch-list', component: BatchListComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'create-batch', component: CreateBatchComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'transactions', component: TransactionsComponent, canActivate: [RoleGuard], data: { roles: STAFF }},
            {path: 'product-list', component: ProductListComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'brand-list', component: BrandListComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'user-list', component: UserListComponent, canActivate: [RoleGuard], data: { roles: STAFF }},
            {path: 'unverified-users', component: UnverifiedUsersComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'product-offers', component: ProductOffersComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'reward-schemes', component: RewardSchemesComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'payouts', component: PayoutsComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'product-catalog', component: ProductCatlogComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'order-list', component: OrderListComponent, canActivate: [RoleGuard], data: { roles: STAFF }},
            {path: 'piechart-dashboard', component: PiechartdashboardComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'product-data-list', component: ProductDataListComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'create-product', component: CreateProductComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'edit-product', component: EditProductComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'transaction-ledger', component: TransactionLedgerComponent},
            {path: 'credit-notes', component: CreditNotesComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
            {path: 'product-category-list', component: ProductCategoryListComponent, canActivate: [RoleGuard], data: { roles: ADMIN }},
        ]

    },
  { path: '**', redirectTo: 'login' }
];
