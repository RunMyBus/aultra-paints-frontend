import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { OrderListComponent } from './order-list.component';
import { ApiRequestService } from '../services/api-request.service';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let apiSpy: jasmine.SpyObj<ApiRequestService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj<ApiRequestService>('ApiRequestService', [
      'getAllOrders',
      'getOrderDealers',
      'retryFocusSync',
    ]);
    apiSpy.getAllOrders.and.returnValue(of({ orders: [], total: 0 }));
    apiSpy.getOrderDealers.and.returnValue(of([
      { _id: 'x', dealerCode: 'D0001', name: 'A' },
    ]));

    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiRequestService, useValue: apiSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('passes status filter through to the service and resets to page 1', () => {
    component.currentPage = 4;
    component.statusFilter = 'PENDING';
    component.onStatusChange();
    expect(component.currentPage).toBe(1);
    expect(apiSpy.getAllOrders).toHaveBeenCalledWith(
      1, component.limit, jasmine.objectContaining({ status: 'PENDING' })
    );
  });

  it('passes dealer code through to the service when a dealer is selected', () => {
    component.onDealerSelect({ item: { _id: 'x', dealerCode: 'D0001', name: 'A' } } as any);
    expect(component.dealerCodeFilter).toBe('D0001');
    expect(apiSpy.getAllOrders).toHaveBeenCalledWith(
      1, component.limit, jasmine.objectContaining({ dealerCode: 'D0001' })
    );
  });

  it('clearFilters resets both filters and reloads', () => {
    component.statusFilter = 'PENDING';
    component.dealerCodeFilter = 'D0001';
    apiSpy.getAllOrders.calls.reset();
    component.clearFilters();
    expect(component.statusFilter).toBe('');
    expect(component.dealerCodeFilter).toBe('');
    expect(apiSpy.getAllOrders).toHaveBeenCalledWith(
      1, component.limit, { status: undefined, dealerCode: undefined }
    );
  });

  it('clears dealer filter when the input is edited away from the selection', () => {
    // Select a dealer first.
    component.onDealerSelect({ item: { _id: 'x', dealerCode: 'D0001', name: 'A' } } as any);
    apiSpy.getAllOrders.calls.reset();

    // Simulate the user editing the input text.
    component.onDealerInputChange('D000');

    expect(component.dealerCodeFilter).toBe('');
    expect(apiSpy.getAllOrders).toHaveBeenCalledWith(
      1, component.limit, jasmine.objectContaining({ dealerCode: undefined })
    );
  });
});
