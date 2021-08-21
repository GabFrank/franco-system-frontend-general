import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { TabService } from '../../../layouts/tab/tab.service';
import { DialogosService } from '../../../shared/components/dialogos/dialogos.service';
import { GenericListService } from '../../../shared/components/generic-list/generic-list.service';
import { productosSearch } from '../../productos/producto/graphql/graphql-query';
import { EditSucursalComponent } from './edit-sucursal/edit-sucursal.component';
import { deleteSucursalQuery, saveSucursal, sucursalQuery } from './graphql/graphql-query';
import { ListSucursalComponent } from './list-sucursal/list-sucursal.component';

@Injectable({
  providedIn: 'root'
})
export class SucursalService extends GenericListService{

  constructor(
    apollo: Apollo,
    tabService: TabService,
    dialogoService: DialogosService
    ){
    super(apollo, tabService, dialogoService);
    this.entityQuery = sucursalQuery;
    this.deleteQuery = deleteSucursalQuery;
    this.searchQuery = productosSearch;
    this.saveQuery = saveSucursal;
    this.editTitle = 'nombre';
    this.deleteTitle = 'nombre';
    this.newTitle = 'Nueva Sucursal';
    this.component = EditSucursalComponent;
    this.parentComponent = ListSucursalComponent;
  }
  
}
