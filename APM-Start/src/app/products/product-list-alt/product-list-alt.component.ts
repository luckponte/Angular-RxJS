import { Component } from '@angular/core';

import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html',
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';

  products$ = this.productService.productsWithCat$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      console.error(err);
      return EMPTY;
    })
  );

  constructor(private productService: ProductService) {}

  onSelected(productId: number): void {
    this.productService.selectProduct(productId);
  }
}
