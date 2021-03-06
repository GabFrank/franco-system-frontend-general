import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject, Observable } from "rxjs";
import { MainService } from "../../../main.service";
import {
  NotificacionColor,
  NotificacionSnackbarService,
} from "../../../notificacion-snackbar.service";
import { DialogosService } from "../../../shared/components/dialogos/dialogos.service";
import { CodigoInput } from "./codigo-input.model";
import { Codigo } from "./codigo.model";
import { CodigoPorCodigoGQL } from "./graphql/codigoPorCodigo";
import { CodigosPorPresentacionIdGQL } from "./graphql/codigoPorPresentacionId";
import { DeleteCodigoGQL } from "./graphql/deleteCodigo";
import { SaveCodigoGQL } from "./graphql/saveCodigo";

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy({ checkProperties: true })
@Injectable({
  providedIn: "root",
})
export class CodigoService {
  dataOBs = new BehaviorSubject<Codigo[]>(null);

  constructor(
    public mainService: MainService,
    private saveCodigo: SaveCodigoGQL,
    private getCodigosPorPresentacionId: CodigosPorPresentacionIdGQL,
    private deleteCodigo: DeleteCodigoGQL,
    private notificacionBar: NotificacionSnackbarService,
    private getCodigoPorCodigo: CodigoPorCodigoGQL,
    private dialogoService: DialogosService
  ) {}

  onGetCodigosPorPresentacionId(id) {
    console.log("haciendo fetch", id);
    return this.getCodigosPorPresentacionId.fetch(
      {
        id,
      },
      {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      }
    );
  }

  onSaveCodigo(input: CodigoInput): Observable<any> {
    if(input.usuarioId==null) input.usuarioId = this.mainService?.usuarioActual?.id;
    input.id == null ? (input.activo = true) : null;
    if(input.principal==false) input.principal = null;
    console.log(input)
    return new Observable((obs) => {
      this.saveCodigo
        .mutate(
          {
            entity: input,
          },
          {
            errorPolicy: "all",
          }
        ).pipe(untilDestroyed(this))
        .subscribe((res) => {
          console.log(res);
          if (res.errors == null) {
            this.notificacionBar.notification$.next({
              texto: "C??digo guardado con ??xito",
              duracion: 2,
              color: NotificacionColor.success,
            });
            obs.next(res.data.data);
          } else {
            let texto = "Ups! Ocurri?? algun problema al guardar";
            if (
              res?.errors[0]?.message?.includes("codigo_un_presentacion_principal")
            ) {
              texto = "Ya existe un c??digo principal!!";
            }
            this.notificacionBar.notification$.next({
              texto,
              duracion: 2,
              color: NotificacionColor.danger,
            });
          }
        });
    });
  }

  onDeleteCodigo(codigo: Codigo): Observable<any> {
    return new Observable((obs) => {
      this.dialogoService
        .confirm(
          "Atenci??n!!",
          "Realemente desea eliminar el c??digo",
          `${codigo.codigo}`
        ).pipe(untilDestroyed(this))
        .subscribe((res1) => {
          if (res1) {
            this.deleteCodigo
              .mutate(
                {
                  id: codigo.id,
                },
                { errorPolicy: "all" }
              ).pipe(untilDestroyed(this))
              .subscribe((res) => {
                if (res.errors == null) {
                  this.notificacionBar.notification$.next({
                    texto: "C??digo eliminado con ??xito",
                    duracion: 2,
                    color: NotificacionColor.success,
                  });
                  obs.next(true);
                } else {
                  {
                    this.notificacionBar.notification$.next({
                      texto: "Ups! Ocurri?? algun problema al eliminar",
                      duracion: 2,
                      color: NotificacionColor.danger,
                    });
                  }
                }
              });
          } else {
          }
        });
    });
  }

  onGetCodigoPorCodigo(texto: string) {
    return this.getCodigoPorCodigo.fetch(
      {
        texto,
      },
      {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      }
    );
  }
}
