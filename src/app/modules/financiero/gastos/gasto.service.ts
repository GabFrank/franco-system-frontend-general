import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GenericCrudService } from '../../../generics/generic-crud.service';
import { Gasto } from './gastos.model';
import { DeleteGastoGQL } from './graphql/deleleGasto';
import { GastoPorCajaIdGQL } from './graphql/gastoPorCajaId';
import { GastoPorIdGQL } from './graphql/gastoPorId';
import { GastosPorFechaGQL } from './graphql/gastosPorFecha';
import { SaveGastoGQL } from './graphql/saveGasto';

@Injectable({
  providedIn: 'root'
})
export class GastoService {

  constructor(
    private genericService: GenericCrudService,
    private gastosPorFecha: GastosPorFechaGQL,
    private saveGasto: SaveGastoGQL,
    private gastoPorId: GastoPorIdGQL,
    private deleteGasto: DeleteGastoGQL,
    private gastoPorCajaId: GastoPorCajaIdGQL
  ) { }

  // onGetAll(): Observable<any> {
  //   return this.genericService.onGetAll(this.getAllGastos);
  // }

  onSave(gasto: Gasto): Observable<Gasto>{
    return this.genericService.onSave(this.saveGasto, gasto.toInput(), environment['printers']['ticket'], environment['local']);
  }

  onGetByDate(inicio?: Date, fin?: Date): Observable<Gasto[]>{
    return this.genericService.onGetByFecha(this.gastosPorFecha, inicio, fin);
  }

  onGetById(id): Observable<Gasto>{
    return this.genericService.onGetById(this.gastoPorId, id);
  }

  onDelete(id): Observable<Gasto>{
    return this.genericService.onDelete(this.deleteGasto, id);
  }

  onGetByCajaId(id): Observable<Gasto[]>{
    return this.genericService.onGetById<Gasto[]>(this.gastoPorCajaId, id);
  }

}
