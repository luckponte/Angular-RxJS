import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BehaviorSubject, combineLatest, EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories$ = this.categoryService.productCategories$.pipe(
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  selectedCatecoryAction$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithCat$,
    this.selectedCatecoryAction$,
  ]).pipe(
    map(([products, category]) =>
      products.filter(
        (p) =>
          !category || p.categoryId === category
      )
    ),
    catchError((err) => {
      this.errorMessage = err;
      console.error(err);
      return EMPTY;
    })
  );

  constructor(
    private productService: ProductService,
    private categoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }
}
