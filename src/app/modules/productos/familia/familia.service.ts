import { Injectable } from '@angular/core';
import { AllFamiliasGQL } from './graphql/allFamilias';
import { BehaviorSubject } from 'rxjs';
import { Familia } from './familia.model';
import { FamiliaInput } from './graphql/familia-input.model';
import { SaveFamiliaGQL } from './graphql/saveFamilia';
import { DeleteFamiliaGQL } from './graphql/deleteFamilia';
import { Observable } from '@apollo/client/utilities';
import { CountFamiliaGQL } from './graphql/countFamilia';
import { MainService } from '../../../main.service';

@Injectable({
  providedIn: 'root',
})
export class FamiliaService {
  familias: Familia[];
  familiaBS = new BehaviorSubject<Familia[]>(null);

  constructor(
    private getFamilias: AllFamiliasGQL,
    private saveFamilia: SaveFamiliaGQL,
    private deleteFamilia: DeleteFamiliaGQL,
    private countFamilia: CountFamiliaGQL,
    private mainService: MainService
    ) {
    this.onGetFamilias()
  }

  onGetFamilias(){
    this.getFamilias.fetch(null, {fetchPolicy: 'no-cache'}).subscribe(res => {
      if(!res.error){
        this.familias = res.data.data;
        this.familiaBS.next(this.familias.sort((a,b)=>{
          if(a.id > b.id) {
            return 1
          } else {
            return -1
          }
        }))
      }
    })
  }

  onSaveFamilia(familiaInput: FamiliaInput): Observable<any>{

    familiaInput.usuarioId = this.mainService?.usuarioActual?.id
    familiaInput.icono == null ? familiaInput.icono = 'block' : null
    return new Observable((obs)=>{
      this.saveFamilia.mutate({
        entity: familiaInput
      }).subscribe(res => {
        if(!res.errors){
          this.onGetFamilias()
          obs.next(res.data)
        }
      })
    })
    
  }



  onDeleteFamilia(id: number){
    return this.deleteFamilia.mutate({
      id
    }).subscribe(res => {
      if(!res.errors){
        this.onGetFamilias()
      }
    })
  }

  onCountFamilia(): Observable<number> {
    return new Observable((obs)=>{
      this.countFamilia.fetch().subscribe(res => {
        if(!res.error){
          return obs.next(res.data.countFamilia)
        }
      })
    }) 
  }

}
