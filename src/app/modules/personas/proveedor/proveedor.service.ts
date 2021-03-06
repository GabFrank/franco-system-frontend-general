import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericCrudService } from '../../../generics/generic-crud.service';
import { ProveedoresSearchByPersonaGQL } from './graphql/proveedorSearchByPersona';
import { Proveedor } from './proveedor.model';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  constructor(
    private genericService: GenericCrudService,
    private proveedorSearch: ProveedoresSearchByPersonaGQL
  ) { }

  onSearch(text: string): Observable<Proveedor[]>{
    return this.genericService.onGetByTexto(this.proveedorSearch, text)
  }
}
