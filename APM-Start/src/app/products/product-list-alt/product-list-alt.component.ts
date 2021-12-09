import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EMPTY, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  private errorMessageSubject = new Subject<string>();
  triggerErrorAction$ = this.errorMessageSubject.asObservable();

  products$ = this.productService.productsWithCat$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      console.error(err);
      return EMPTY;
    })
  );
  selectedProduct$ = this.productService.selectedProduct$;

  constructor(private productService: ProductService) {}

  onSelected(productId: number): void {
    this.productService.selectProduct(productId);
  }
}
