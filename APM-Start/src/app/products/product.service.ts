import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  merge,
  Observable,
  Subject,
  throwError,
} from 'rxjs';
import { catchError, map, scan, shareReplay, tap } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  private selectedProductSubject = new BehaviorSubject<number>(0);
  selectAction$ = this.selectedProductSubject.asObservable();

  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  rawProducts$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCat$ = combineLatest([
    this.rawProducts$,
    this.categoryService.productCategories$,
  ]).pipe(
    map(([products, category]) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price * 1.5,
            searchKey: [product.productName],
            category: category.find((c) => c.id === product.categoryId).name,
          } as Product)
      )
    ),
    shareReplay(1),
  );

  products$ = merge(this.productsWithCat$, this.productInsertedAction$).pipe(
    scan((acc: Product[], val: Product) => [...acc, val]),
  );

  selectedProduct$ = combineLatest([
    this.productsWithCat$,
    this.selectAction$,
  ]).pipe(
    map(([products, selected]) => products.find((p) => p.id === selected)),
    tap((product) => console.log(`Selected: ${product}`)),
    shareReplay(1),
  );

  constructor(
    private http: HttpClient,
    private supplierService: SupplierService,
    private categoryService: ProductCategoryService
  ) {}

  getProducts(): Observable<Product[]> {
    return EMPTY;
  }

  selectProduct(selectedId: number): void {
    this.selectedProductSubject.next(selectedId);
  }

  addProduct(newProduct?:Product): void {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }

  private fakeProduct(): Product {
    return {
      id: Math.floor( Math.random() * 1000),
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: +(Math.random() * 100).toFixed(2),
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: Math.floor(Math.random() * 1000),
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
