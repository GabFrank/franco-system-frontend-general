import { TransferenciaTimelineDialogComponent } from '../../../transferencias/transferencia-timeline-dialog/transferencia-timeline-dialog.component';
import { TipoEntidad } from './../../../../generics/tipo-entidad.enum';
import { QrCodeComponent, QrData } from './../../../../shared/qr-code/qr-code.component';
import { CargandoDialogService } from './../../../../shared/components/cargando-dialog/cargando-dialog.service';
import { TransferenciaService } from './../transferencia.service';
import { PdvSearchProductoData, PdvSearchProductoDialogComponent, PdvSearchProductoResponseData } from '../../../productos/producto/pdv-search-producto-dialog/pdv-search-producto-dialog.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTableDataSource } from '@angular/material/table';
import { MainService } from '../../../../main.service';
import { Presentacion } from '../../../productos/presentacion/presentacion.model';
import { Sucursal } from '../../../empresarial/sucursal/sucursal.model';
import { SeleccionarSucursalDialogComponent } from '../seleccionar-sucursal-dialog/seleccionar-sucursal-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CreateItemDialogComponent } from '../create-item-dialog/create-item-dialog.component';
import { updateDataSourceInsertFirst, updateDataSourceWithId } from '../../../../commons/core/utils/numbersUtils';
import { EtapaTransferencia, TipoTransferencia, Transferencia, TransferenciaEstado, TransferenciaItem } from '../transferencia.model';
import { Tab } from '../../../../layouts/tab/tab.model';
import { SelectionModel } from '@angular/cdk/collections';
import { ModificarItemDialogComponent } from '../modificar-item-dialog/modificar-item-dialog.component';



@UntilDestroy()
@Component({
  selector: 'app-edit-transferencia',
  templateUrl: './edit-transferencia.component.html',
  styleUrls: ['./edit-transferencia.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class EditTransferenciaComponent implements OnInit {

  @Input()
  data: Tab;

  columnsToDisplay = ['producto', 'codigo', 'presentacion', 'cantidad', 'precio', 'vencimiento', 'estado', 'menu']

  selectedSucursalOrigen: Sucursal;

  selectedSucursalDestino: Sucursal;

  selectedTransferencia = new Transferencia;

  dataSource = new MatTableDataSource<TransferenciaItem>([])

  expandedElement: TransferenciaItem;

  selectedEtapa: EtapaTransferencia;

  isDialogOpen = false;

  page = 0;
  size = 10;

  isLastPage = false;

  isPreTransferenciaCreacion = false;
  isPreTransferenciaOrigen = false;
  isPreparacionMercaderia = false;
  isPreparacionMercaderiaConcluida = false;
  isTransporteVerificacion = false;
  isTransporteEnCamino = false;
  isTransporteEnDestino = false;
  isRecepcionEnVerificacion = false;
  isRecepcionConcluida = false;
  isAllConfirmedPreparacion = false;
  isAllConfirmedTransporte = false;
  isAllConfirmedRecepcion = false;

  isOrigen = false;
  isDestino = false;

  selection = new SelectionModel<TransferenciaItem>(true, []);

  etapaList;

  puedeEditar = false;

  selectedResponsable;

  constructor(private matDialog: MatDialog,
    public mainService: MainService,
    private transferenciaService: TransferenciaService,
    private cargandoService: CargandoDialogService) { }

  ngOnInit(): void {

    this.etapaList = Object.values(EtapaTransferencia)

    this.selectedTransferencia.usuarioPreTransferencia = this.mainService.usuarioActual;
    this.selectedTransferencia.tipo = TipoTransferencia.MANUAL;
    this.selectedTransferencia.estado = TransferenciaEstado.ABIERTA;
    this.selectedTransferencia.etapa = EtapaTransferencia.PRE_TRANSFERENCIA_CREACION;

    if (this.data?.tabData != null && this.data?.tabData['id']) {
      this.cargarDatos()
    } else {
      setTimeout(() => {
        this.selectSucursales()
        this.verificarEtapa()
      }, 1000);
    }

  }

  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    let key = event.key;
    if (this.isDialogOpen) {
      return null;
    }
    if (this.selectedTransferencia.etapa == EtapaTransferencia.PRE_TRANSFERENCIA_CREACION) {
      switch (key) {
        case 'Enter':
          this.onAddItem()
          break;

        default:
          break;
      }
    }
  }

  selectSucursales() {
    this.isDialogOpen = true;
    this.matDialog.open(SeleccionarSucursalDialogComponent, {
      width: '80%',
      height: '70%',
      disableClose: false
    }).afterClosed().subscribe(async res => {
      this.isDialogOpen = false;
      if (res != null) {
        this.selectedTransferencia.sucursalOrigen = res['sucursalOrigen']
        this.selectedTransferencia.sucursalDestino = res['sucursalDestino']
      }
    })
  }

  cargarDatos() {
    this.cargandoService.openDialog(false, 'Cargando datos')
    let id = this.data.tabData['id'];
    if (id != null) {
      this.transferenciaService.onGetTransferencia(id)
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          this.cargandoService.closeDialog()
          if (res != null) {
            this.selectedTransferencia = res;
            this.getTransferenciaItemList()
            this.isOrigen = this.selectedTransferencia?.sucursalOrigen?.id == this.mainService?.sucursalActual?.id;
            this.isDestino = this.selectedTransferencia?.sucursalDestino?.id == this.mainService?.sucursalActual?.id;
            this.onVerificarConfirmados()
            this.verificarEtapa()
          }
        })
    }

  }

  getTransferenciaItemList() {
    this.transferenciaService.onGetTransferenciaItensPorTransferenciaId(this.selectedTransferencia.id, this.page, this.size).pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res != null) {
          if (res.length < this.size) {
            this.isLastPage = true;
          }
          if (this.dataSource.data.length == 0) {
            this.dataSource.data = res;
          } else {
            this.dataSource.data = this.dataSource.data.concat(res)
          }
        }
      })
  }

  cargarMasDatos() {
    this.page++;
    this.getTransferenciaItemList()
  }

  onRefresh() {
    this.cargarDatos()
  }

  verificarEtapa() {
    this.setAllEtapasFalse()
    switch (this.selectedTransferencia?.etapa) {
      case EtapaTransferencia.PRE_TRANSFERENCIA_CREACION:
        this.isPreTransferenciaCreacion = true;
        this.selectedResponsable = this.selectedTransferencia?.usuarioPreTransferencia;
        break;
      case EtapaTransferencia.PRE_TRANSFERENCIA_ORIGEN:
        this.isPreTransferenciaOrigen = true;
        this.selectedResponsable = this.selectedTransferencia?.usuarioPreTransferencia;
        break;
      case EtapaTransferencia.PREPARACION_MERCADERIA:
        this.isPreparacionMercaderia = true;
        this.selectedResponsable = this.selectedTransferencia?.usuarioPreparacion;
        break;
      case EtapaTransferencia.PREPARACION_MERCADERIA_CONCLUIDA:
        this.selectedResponsable = this.selectedTransferencia?.usuarioPreparacion;
        this.isPreparacionMercaderiaConcluida = true;
        this.dataSource.data = this.dataSource.data.filter(i => i.motivoRechazoPreparacion == null)
        break;
      case EtapaTransferencia.TRANSPORTE_VERIFICACION:
        this.isTransporteVerificacion = true;
        this.selectedResponsable = this.selectedTransferencia?.usuarioTransporte;
        this.dataSource.data = this.dataSource.data.filter(i => i.motivoRechazoPreparacion == null)
        break;
      case EtapaTransferencia.TRANSPORTE_EN_CAMINO:
        this.selectedResponsable = this.selectedTransferencia?.usuarioTransporte;
        this.isTransporteEnCamino = true;
        this.dataSource.data = this.dataSource.data.filter(i => i.motivoRechazoPreparacion == null && i.motivoRechazoTransporte == null)
        break;
      case EtapaTransferencia.TRANSPORTE_EN_DESTINO:
        this.isTransporteEnDestino = true;
        this.selectedResponsable = this.selectedTransferencia?.usuarioRecepcion;
        break;
      case EtapaTransferencia.RECEPCION_EN_VERIFICACION:
        this.isRecepcionEnVerificacion = true;
        this.selectedResponsable = this.selectedTransferencia?.usuarioRecepcion;
        this.dataSource.data = this.dataSource.data.filter(i => i.motivoRechazoPreparacion == null && i.motivoRechazoTransporte == null)
        break;
      case EtapaTransferencia.RECEPCION_CONCLUIDA:
        this.isRecepcionConcluida = true;
        this.selectedResponsable = this.selectedTransferencia?.usuarioRecepcion;
        break;
      default:
        break;
    }

    if (this.selectedResponsable.id == this.mainService.usuarioActual.id || this.selectedResponsable.id == null) {
      this.puedeEditar = true;
    }
    this.onVerificarConfirmados()
  }

  setAllEtapasFalse() {
    this.isPreTransferenciaCreacion = false;
    this.isPreTransferenciaOrigen = false;
    this.isPreparacionMercaderia = false;
    this.isPreparacionMercaderiaConcluida = false;
    this.isTransporteVerificacion = false;
    this.isTransporteEnCamino = false;
    this.isTransporteEnDestino = false;
    this.isRecepcionEnVerificacion = false;
    this.isRecepcionConcluida = false;
  }



  onAddItem() {
    this.isDialogOpen = true;
    let data: PdvSearchProductoData = {
      texto: null,
      cantidad: 1,
      mostrarOpciones: false,
      mostrarStock: true,
      conservarUltimaBusqueda: true
    }
    this.matDialog.open(PdvSearchProductoDialogComponent, {
      data: data,
      height: '80%',
    }).afterClosed().subscribe(res => {
      this.isDialogOpen = false;
      let response: PdvSearchProductoResponseData = res;
      if (response.presentacion != null) {
        this.createItem(response.presentacion)
      }
    })
  }

  createItem(presentacion: Presentacion, item?) {
    this.isDialogOpen = true;
    this.matDialog.open(CreateItemDialogComponent, {
      data: {
        item,
        presentacion,
        transferencia: this.selectedTransferencia
      },
      width: '40%',
      disableClose: true
    }).afterClosed().subscribe(async res => {
      this.isDialogOpen = false;
      if (res != null) {
        if (this.selectedTransferencia?.id == null) {
          this.onSaveTransferencia().then(() => {
            this.onSaveTransferenciaItem(res['item'])
          })
        } else {
          this.onSaveTransferenciaItem(res['item'])
        }
      }
    })
  }

  onSaveTransferencia(): Promise<any> {
    this.cargandoService.openDialog()
    return new Promise((resolve, reject) => {
      this.transferenciaService.onSaveTransferencia(this.selectedTransferencia.toInput())
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          this.cargandoService.closeDialog()
          if (res != null) {
            this.selectedTransferencia = res;
            resolve(res)
          } else {
            reject()
          }
        })
    })
  }

  onSaveTransferenciaItem(item: TransferenciaItem) {
    let auxItem = new TransferenciaItem;
    let isNew = item?.id == null;
    Object.assign(auxItem, item)
    auxItem.transferencia = this.selectedTransferencia;
    this.cargandoService.openDialog()
    this.transferenciaService.onSaveTransferenciaItem(auxItem.toInput())
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.cargandoService.closeDialog()
        if (res != null) {
          if (!isNew) {
            this.dataSource.data = updateDataSourceWithId(this.dataSource.data, res, res?.id);
          } else {
            this.isLastPage = false;
            this.page = 0;
            this.dataSource.data = updateDataSourceInsertFirst(this.dataSource.data, res);
            let lenght = this.dataSource.data.length;
            if (lenght > this.size) {
              let diff = lenght - this.size;
              let aux = this.dataSource.data;
              aux.splice(4, diff)
              this.dataSource.data = aux;
            }
          }
        }
      })
  }

  onDeleteItem(item: TransferenciaItem) {
    this.transferenciaService.onDeleteTransferenciaItem(item.id)
  }

  onEditItem(item: TransferenciaItem) {
    this.createItem(null, item)
  }

  onFinalizar() {
    this.transferenciaService.onFinalizar(this.selectedTransferencia)
      .pipe()
      .subscribe(res => {
        if (res) {
          this.selectedTransferencia.estado = TransferenciaEstado.EN_ORIGEN;
          this.selectedTransferencia.etapa = EtapaTransferencia.PRE_TRANSFERENCIA_ORIGEN;
          this.verificarEtapa()
        }
      })
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  onSelectRow(row) {
    this.selection.toggle(row);
    console.log(row)
  }

  onEditClick(row) {

  }

  onConfirm(item: TransferenciaItem) {
    let newItem = new TransferenciaItem;
    item = Object.assign(newItem, item)
    if (this.selectedTransferencia?.etapa == EtapaTransferencia.PREPARACION_MERCADERIA) {
      item.cantidadPreparacion = item.cantidadPreTransferencia;
      item.presentacionPreparacion = item.presentacionPreTransferencia;
      item.vencimientoPreparacion = item?.vencimientoPreTransferencia;
    } else if (this.selectedTransferencia?.etapa == EtapaTransferencia.TRANSPORTE_VERIFICACION) {
      item.cantidadTransporte = item.cantidadPreparacion;
      item.presentacionTransporte = item.presentacionPreparacion;
      item.vencimientoTransporte = item?.vencimientoPreparacion;
    } else if (this.selectedTransferencia?.etapa == EtapaTransferencia.RECEPCION_EN_VERIFICACION) {
      item.cantidadRecepcion = item.cantidadTransporte;
      item.presentacionRecepcion = item.presentacionTransporte;
      item.vencimientoRecepcion = item?.vencimientoTransporte;
    }
    this.transferenciaService.onSaveTransferenciaItem(item.toInput())
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res != null) {
          this.dataSource.data = updateDataSourceWithId(this.dataSource.data, item, item.id)
        }
        this.onVerificarConfirmados()
      })
  }


  onDesconfirm(item: TransferenciaItem) {
    let newItem = new TransferenciaItem;
    item = Object.assign(newItem, item)
    if (this.selectedTransferencia?.etapa == EtapaTransferencia.PREPARACION_MERCADERIA) {
      item.cantidadPreparacion = null
      item.presentacionPreparacion = null
      item.vencimientoPreparacion = null
    } else if (this.selectedTransferencia?.etapa == EtapaTransferencia.TRANSPORTE_VERIFICACION) {
      item.cantidadTransporte = null
      item.presentacionTransporte = null
      item.vencimientoTransporte = null
    } else if (this.selectedTransferencia?.etapa == EtapaTransferencia.RECEPCION_EN_VERIFICACION) {
      item.cantidadRecepcion = null
      item.presentacionRecepcion = null
      item.vencimientoRecepcion = null
    }
    this.transferenciaService.onSaveTransferenciaItem(item.toInput())
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res != null) {
          this.dataSource.data = updateDataSourceWithId(this.dataSource.data, res, res.id)
        }
        this.onVerificarConfirmados()
      })
  }

  onVerificarConfirmados() {
    let okPreparacion = true;
    let okTransporte = true;
    let okRecepcion = true;
    this.dataSource.data.find(i => {
      if (this.selectedTransferencia.etapa == EtapaTransferencia.PREPARACION_MERCADERIA && i.cantidadPreparacion == null && i.vencimientoPreparacion == null && i.motivoRechazoPreparacion == null) {
        okPreparacion = false;
      } else if (this.selectedTransferencia.etapa == EtapaTransferencia.TRANSPORTE_VERIFICACION && i.cantidadTransporte == null && i.vencimientoTransporte == null && i.motivoRechazoTransporte == null) {
        okTransporte = false;
      } else if (this.selectedTransferencia.etapa == EtapaTransferencia.RECEPCION_EN_VERIFICACION && i.cantidadRecepcion == null && i.vencimientoRecepcion == null && i.motivoRechazoRecepcion == null) {
        okRecepcion = false;
      }
    })
    this.isAllConfirmedPreparacion = okPreparacion;
    this.isAllConfirmedTransporte = okTransporte;
    this.isAllConfirmedRecepcion = okRecepcion;
  }

  onModificarCantidad(item) {
    this.onModificarItem(item, true, false, false)
  }
  onModificarVencimiento(item) {
    this.onModificarItem(item, false, true, false)

  }
  onRechazar(item) {
    this.onModificarItem(item, false, false, true)
  }

  onModificarItem(item, cantidad?: boolean, vencimiento?: boolean, rechazar?: boolean) {
    this.isDialogOpen = true;
    this.matDialog.open(ModificarItemDialogComponent, {
      data: {
        item,
        isCantidad: cantidad,
        isVencimiento: vencimiento,
        isRechazar: rechazar,
        etapa: this.selectedTransferencia?.etapa
      },
      width: '500px'
    }).afterClosed().subscribe(res => {
      this.isDialogOpen = false;
      if (res?.item != null) {
        this.transferenciaService.onSaveTransferenciaItem(res['item'].toInput())
          .pipe(untilDestroyed(this))
          .subscribe(res2 => {
            if (res2 != null) {
              this.dataSource.data = updateDataSourceWithId(this.dataSource.data, res2, res2.id)
            }
            this.onVerificarConfirmados()
          })
      }
    })
  }

  onAvanzarEtapa(etapa) {
    console.log(etapa)
    this.transferenciaService.onAvanzarEtapa(this.selectedTransferencia, etapa)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res) {
          this.selectedTransferencia.etapa = etapa;
          this.verificarEtapa()
          if (etapa == EtapaTransferencia.PRE_TRANSFERENCIA_ORIGEN) {
            this.selectedTransferencia.estado = TransferenciaEstado.EN_ORIGEN;
          } else if (etapa == EtapaTransferencia.TRANSPORTE_EN_CAMINO) {
            this.selectedTransferencia.estado = TransferenciaEstado.EN_TRANSITO;
          } else if (etapa == EtapaTransferencia.RECEPCION_EN_VERIFICACION) {
            this.selectedTransferencia.estado = TransferenciaEstado.EN_DESTINO;
          }
        }
      })
  }

  onSelectEstado(etapa: EtapaTransferencia) {
  }

  onSelectEtapa(e) {

  }

  onSolicitarModificarItem(item) { }
  onSolicitarRechazarItem(item) { }

  onQrClick() {
    let codigo: QrData = {
      'sucursalId': this.mainService.sucursalActual.id,
      'tipoEntidad': TipoEntidad.TRANSFERENCIA,
      'idOrigen': this.selectedTransferencia.id,
      'idCentral': this.selectedTransferencia.id,
      'componentToOpen': 'EditTransferenciaComponent'
    }
    this.isDialogOpen = true;
    this.matDialog.open(QrCodeComponent, {
      data: {
        codigo: codigo,
        nombre: 'Transferencia'
      }
    }).afterClosed().subscribe(res => {
      this.isDialogOpen = false;
    })
  }

  onOpenTimeLine() {
    this.isDialogOpen = true;
    this.matDialog.open(TransferenciaTimelineDialogComponent, {
      data: this.selectedTransferencia,
      width: '70vw'
    }).afterClosed().subscribe(res => {
      this.isDialogOpen = false;
    })
  }
}
