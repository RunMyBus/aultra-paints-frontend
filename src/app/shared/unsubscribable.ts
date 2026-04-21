import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Base class for components that subscribe to observables. Consumers should
 * pipe `takeUntil(this.destroy$)` on every subscription — ngOnDestroy here
 * completes the subject so RxJS cleans the chain up.
 *
 * Declared as a Directive so Angular's DI picks up the lifecycle hook even
 * when this class is extended by standalone components.
 */
@Directive()
export abstract class Unsubscribable implements OnDestroy {
  protected readonly destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
