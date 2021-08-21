import { Injectable } from '@angular/core';
import { Query } from 'apollo-angular';
import { Producto } from '../producto.model';
import { productoPorProveedor, productoQuery, productoUltimasComprasQuery } from './graphql-query';

export interface Response {
  data: Producto;
}

@Injectable({
  providedIn: 'root',
})
export class ProductoUltimasComprasByIdGQL extends Query<Response> {
  document = productoUltimasComprasQuery;
}
