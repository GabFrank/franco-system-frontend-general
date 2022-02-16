import { Injectable } from '@angular/core';
import { Mutation, Query } from 'apollo-angular';
import { Venta } from '../venta.model';
import { cancelarVentaQuery, saveVenta } from './graphql-query';

class Response {
  data: boolean
}

@Injectable({
  providedIn: 'root',
})
export class CancelarVentaGQL extends Mutation<Response> {
  document = cancelarVentaQuery;
}