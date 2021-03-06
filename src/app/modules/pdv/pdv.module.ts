import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RestaurantComponent } from "./restaurant/restaurant.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MaterialModule } from "../../commons/core/material.module";
import { SharedModule } from "../../shared/shared.module";
import { VentaTouchComponent } from "./comercial/venta-touch/venta-touch.component";
import { ProductoCategoriaDialogComponent } from "./comercial/venta-touch/producto-categoria-dialog/producto-categoria-dialog.component";
import { EditItemDialogComponent } from "./comercial/venta-touch/edit-item-dialog/edit-item-dialog.component";
import { PagoTouchComponent } from "./comercial/venta-touch/pago-touch/pago-touch.component";
import { NgxCurrencyModule } from "ngx-currency";
import { VueltoDialogComponent } from "./comercial/venta-touch/vuelto-dialog/vuelto-dialog.component";
import { SeleccionarBilletesTouchComponent } from "./comercial/venta-touch/seleccionar-billetes-touch/seleccionar-billetes-touch.component";
import { DescuentoDialogComponent } from "./comercial/venta-touch/descuento-dialog/descuento-dialog.component";
import { TarjetaDialogComponent } from "./comercial/venta-touch/tarjeta-dialog/tarjeta-dialog.component";
import { DeliveryDialogComponent } from "./comercial/venta-touch/delivery-dialog/delivery-dialog.component";
import { RedondeoDialogComponent } from "./comercial/venta-touch/redondeo-dialog/redondeo-dialog.component";
import { SelectProductosDialogComponent } from "./comercial/venta-touch/select-productos-dialog/select-productos-dialog.component";
import { AddCategoriaDialogComponent } from "./comercial/venta-touch/pdv-categoria/add-categoria-dialog/add-categoria-dialog.component";
import { SeleccionarCajaDialogComponent } from "./comercial/venta-touch/seleccionar-caja-dialog/seleccionar-caja-dialog.component";
import { UtilitariosDialogComponent } from "./comercial/venta-touch/utilitarios-dialog/utilitarios-dialog.component";
import { NgxPrintElementModule } from "ngx-print-element";
import { AdicionarPdvProductoDialogComponent } from "./comercial/venta-touch/adicionar-pdv-producto-dialog/adicionar-pdv-producto-dialog.component";
import { SeleccionarEnvaseDialogComponent } from './comercial/venta-touch/seleccionar-envase-dialog/seleccionar-envase-dialog.component';
import { GarantiaDevolucionDialogComponent } from './venta-touch/garantia-devolucion-dialog/garantia-devolucion-dialog.component';
import { GarantiaDialogComponent } from './venta-touch/garantia-devolucion/garantia-dialog/garantia-dialog.component';
import { DevolucionDialogComponent } from './venta-touch/garantia-devolucion/devolucion-dialog/devolucion-dialog.component';
import { ItemListComponent } from './layout/item-list/item-list.component';
import { TotalesComponent } from './layout/totales/totales.component';
import { FavoritosComponent } from './layout/favoritos/favoritos.component';
import { BuscadorComponent } from './layout/buscador/buscador.component';

@NgModule({
  declarations: [
    RestaurantComponent,
    VentaTouchComponent,
    ProductoCategoriaDialogComponent,
    EditItemDialogComponent,
    PagoTouchComponent,
    VueltoDialogComponent,
    SeleccionarBilletesTouchComponent,
    DescuentoDialogComponent,
    TarjetaDialogComponent,
    DeliveryDialogComponent,
    RedondeoDialogComponent,
    SelectProductosDialogComponent,
    AddCategoriaDialogComponent,
    AdicionarPdvProductoDialogComponent,
    SeleccionarCajaDialogComponent,
    UtilitariosDialogComponent,
    SeleccionarEnvaseDialogComponent,
    GarantiaDevolucionDialogComponent,
    GarantiaDialogComponent,
    DevolucionDialogComponent,
    ItemListComponent,
    TotalesComponent,
    FavoritosComponent,
    BuscadorComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedModule,
    NgxPrintElementModule,
  ],
})
export class PdvModule {}
