import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
const { readFileSync } = window.require('fs');
import { isDevMode } from '@angular/core';
import { AppModule } from './app/app.module';
import { APP_CONFIG, environment } from './environments/environment';
const electron = window.require('electron');

if (APP_CONFIG.production) {
  enableProdMode();
}

(async () => {
  var configPath;
  if (isDevMode) {
    configPath = "./configuracion.json"
  } else if (process.platform == 'darwin') {
    configPath = "./configuracion.json"
  } else if (process.platform == 'win32') {
    configPath = ".\\configuracion.json"
  }
  var configFile = JSON.parse(readFileSync(configPath));

  if (configFile != null) {
    environment['sucursales'] = configFile['sucursales'];
    if (localStorage.getItem('ip') != null) {
      environment['serverIp'] = localStorage.getItem('ip');
      environment['serverPort'] = +localStorage.getItem('port');
    } else {
      environment['serverIp'] = configFile.serverUrl;
      environment['serverPort'] = configFile.serverPort
    }

  } else {
    environment['serverIp'] = 'localhost';
    environment['serverPort'] = 8082
  }

  platformBrowserDynamic()
    .bootstrapModule(AppModule, {
      preserveWhitespaces: false
    })
    .catch(err => console.error(err));
})();


