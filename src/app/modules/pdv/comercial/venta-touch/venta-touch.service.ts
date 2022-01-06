import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PdvCaja } from '../../../financiero/pdv/caja/caja.model';
import { CajaService } from '../../../financiero/pdv/caja/caja.service';
import { Cobro } from '../../../operaciones/venta/cobro/cobro.model';
import { Venta } from '../../../operaciones/venta/venta.model';
import { VentaService } from '../../../operaciones/venta/venta.service';

@Injectable({
  providedIn: 'root'
})
export class VentaTouchService {

  cajaSub = new BehaviorSubject<PdvCaja>(null);
  selectedCaja: PdvCaja;

  constructor(
    private cajaService: CajaService,
    private ventaService: VentaService
  ) {
    
   }
  onGetCaja(){
    return new Observable(obs => {
      let usuarioId = localStorage.getItem('usuarioId');
      if(usuarioId!=null){
        this.cajaService.onGetByUsuarioIdAndAbierto(+usuarioId).subscribe(res => {
          if(res!=null){
            this.selectedCaja = res;
            obs.next(res)
          }
        })
      }
    })
  }

  selectCaja(caja: PdvCaja){
    if(caja.activo == true){
      this.selectedCaja = caja;
    }
  }

  onSaveVenta(venta: Venta, cobro: Cobro): Observable<any>{
    return this.ventaService.onSaveVenta(venta, cobro)
  }
}