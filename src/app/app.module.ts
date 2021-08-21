import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DefaultModule } from './layouts/default/default.module';
import { FlexLayoutModule } from '@angular/flex-layout'
import { BootstrapModule } from './commons/core/bootstrap.module';
import { MaterialModule } from './commons/core/material.module';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ModulesModule } from './modules/modules.module';
import { DetailPopupComponent } from './layouts/detail-popup/detail-popup.component';
import localePY from '@angular/common/locales/es-PY';
import { registerLocaleData } from '@angular/common';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FormatNumberPipe } from './pipes/format-number.pipe';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { MainService } from './main.service';
import { APP_INITIALIZER } from '@angular/core';
import {Apollo, APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, ApolloLink, InMemoryCache, split} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import {WebSocketLink} from '@apollo/client/link/ws';
import {getMainDefinition, Observable} from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { ConnectionService } from 'ngx-connection-service';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BehaviorSubject } from 'rxjs';
import { setContext } from '@apollo/client/link/context';

export const errorObs = new BehaviorSubject<any>(null);

const uri = 'http://localhost:8081/graphql';

// error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  // if (graphQLErrors)
  //   graphQLErrors.map(({ message, locations, path }) =>
  //     errorObs.next({message, locations, path})
  //     console.log(
  //       `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
  //     ),
  //   );

  // if (networkError) console.log(`[Network error]: ${networkError}`);
})

registerLocaleData(localePY)
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

export function appInit(appConfigService: MainService) {
  return () => appConfigService.load();
}
@NgModule({
  declarations: [
    AppComponent,
    DetailPopupComponent,
    FormatNumberPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    DefaultModule,
    ModulesModule,
    MaterialModule,
    FlexLayoutModule,
    BootstrapModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    NgxMaskModule.forRoot(),
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink): ApolloClientOptions<any> {

        const basic = setContext((operation, context) => ({
          headers: {
            Accept: 'charset=utf-8'
          }
        }));

        const auth = setContext((operation, context) => {
          const token = localStorage.getItem('token');
          console.log(token)
          if (token === null) {
            return {};
          } else {
            return {
              headers: {
                'Authorization': `Token ${token}`
              }
            };
          }
        });

        // Create an http link:
        const http = ApolloLink.from([basic, auth, httpLink.create({ uri })]);

        // Create a WebSocket link:
        const ws = new WebSocketLink({
          uri: `ws://localhost:8081/subscriptions`,
          options: {
            reconnect: true,
          },
        });

        

        

        // using the ability to split links, you can send data to each link
        // depending on what kind of operation is being sent
        const link = errorLink.concat(split(
          // split based on operation type
          
          ({query}) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
            );
          },
          ws,
          http,
        ));


        return {
          link,
          cache: new InMemoryCache()
        };
      },
      deps: [HttpLink],
    },
    { provide: LOCALE_ID, useValue: 'es-PY' } ,
    { provide: MAT_DATE_LOCALE, useValue: 'es-PY' },
    [MainService, {provide : APP_INITIALIZER, useFactory : appInit, deps: [MainService] , multi : true}]

  ],
  bootstrap: [AppComponent]
})
export class AppModule { 

  

  constructor(
  ){
  }
}
