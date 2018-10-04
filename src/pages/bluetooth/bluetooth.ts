import { Component, Injectable } from '@angular/core';
import { IonicPage, Platform, ToastController, AlertController, Refresher, NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
//servicio
import { CommunicationService } from '../../app/Service/CommunicationService';
//paginas
import { concat } from 'rxjs/observable/concat';
//nuevos
import { of } from 'rxjs/observable/of';
import { interval } from 'rxjs/observable/interval';
import { delay } from 'rxjs/operators';

@Injectable()
@Component({
  selector: 'bluetooth-page',
  templateUrl: 'bluetooth.html'
})
export class BluetoothPage {

  devices: Array<any> = [];
  spinner = true;
  message: string = "";
  connection: ISubscription;
  connectionMessages: ISubscription;
  reader: Observable<any>;
  rawListener;
  //variables nuevas
  conectadoA: string = "";
  dataSalida: Array<any> = [];
  estaConectado = false;
  //variables de hex
  //responsePIDS;
  modeRealTime = "01";
  modeRequestDTC = "03";
  modeClearDTC = "04";
  modeVin = "09";
  colorBlue = 'danger';
  conexionMensajes: ISubscription;
  conexionMensajesT: ISubscription;
  conexionMensajesR: ISubscription;
  conexionMensajesF: ISubscription;
  conexionMensajesTHR: ISubscription;
  //variable para mostrar la velocidad
  velocidadActual: number;
  temperaturaActual: number;
  rpmActual: number;
  flujoAireActual: number;
  throttleposActual: number;
  interval: any;
  intervalRpm: any;
  intervalTmp: any;
  intervalFlujo: any;
  intervalThrottlepos: any;
  //nuevas variables de objetos completos
  objVelocidadActual = {
    Message: '',
    Mode: '',
    Pid: '',
    Name: '',
    Description: '',
    Value: 0,
    Minima: 0,
    Maxima: 0,
    Unit: '',
    Date: new Date()
  };
  objRpmActual = {
    Message: '',
    Mode: '',
    Pid: '',
    Name: '',
    Description: '',
    Value: 0,
    Minima: 0,
    Maxima: 0,
    Unit: '',
    Date: new Date()
  };
  objTempActual = {
    Message: '',
    Mode: '',
    Pid: '',
    Name: '',
    Description: '',
    Value: 0,
    Minima: 0,
    Maxima: 0,
    Unit: '',
    Date: new Date()
  };
  objFlujoAireActual = {
    Message: '',
    Mode: '',
    Pid: '',
    Name: '',
    Description: '',
    Value: 0,
    Minima: 0,
    Maxima: 0,
    Unit: '',
    Date: new Date()
  };
  //throttlepos
  objThrottleposActual = {
    Message: '',
    Mode: '',
    Pid: '',
    Name: '',
    Description: '',
    Value: 0,
    Minima: 0,
    Maxima: 0,
    Unit: '',
    Date: new Date()
  };
  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetoothSerial: BluetoothSerial,
    public blueService: CommunicationService,
    public navCtrl: NavController,
  ) { 
    if (this.estaConectado)
    {
      this.colorBlue = 'secondary';
    }
    else{
      this.colorBlue = 'danger';
    }
    //inicializacion
    this.velocidadActual = 0;
    this.temperaturaActual = 0;
    this.rpmActual = 0;
    this.flujoAireActual = 0;
    this.throttleposActual = 0;
    //seteo de los objetos
    this.objVelocidadActual = {
      Message: '',
      Mode: '',
      Pid: '',
      Name: '',
      Description: '',
      Value: 0,
      Minima: 0,
      Maxima: 0,
      Unit: '',
      Date: new Date()
    };
    this.objRpmActual = {
      Message: '',
      Mode: '',
      Pid: '',
      Name: '',
      Description: '',
      Value: 0,
      Minima: 0,
      Maxima: 0,
      Unit: '',
      Date: new Date()
    };
    this.objTempActual = {
      Message: '',
      Mode: '',
      Pid: '',
      Name: '',
      Description: '',
      Value: 0,
      Minima: 0,
      Maxima: 0,
      Unit: '',
      Date: new Date()
    };
    this.objFlujoAireActual = {
      Message: '',
      Mode: '',
      Pid: '',
      Name: '',
      Description: '',
      Value: 0,
      Minima: 0,
      Maxima: 0,
      Unit: '',
      Date: new Date()
    };
    //throttlepos
    this.objThrottleposActual = {
      Message: '',
      Mode: '',
      Pid: '',
      Name: '',
      Description: '',
      Value: 0,
      Minima: 0,
      Maxima: 0,
      Unit: '',
      Date: new Date()
    };

  }
  
  iniciarIntervalo() {
    var sms = "010D";
    Observable.interval(5000).subscribe(() => {
      this.enviarmessagesI(sms);
    });
  }
  /**
   * Al entrar en la ventana ejecuta la función para buscar dispositivos bluetooth.
   */
  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.buscarBluetooth().then((success: Array<Object>) => {
        this.devices = success;
        this.spinner = false;
      }, fail => {
        this.presentToast(fail);
        this.spinner = false;
      });
    });
  }
  /**
   * Al cerrar la aplicación se asegura de que se cierre la conexión bluetooth.
   */
  public ngOnDestroy() {
    this.disconnecter();
  }
  /**
   * Busca los dispositivos bluetooth disponibles, evalúa si es posible usar la funcionalidad
   * bluetooth en el dispositivo.
   * @return {Promise<any>} Regresa una lista de los dispositivos que se localizaron.
   */
  buscarBluetooth(): Promise<Object> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isEnabled().then(success =>{
        this.bluetoothSerial.discoverUnpaired().then(success => {
          if (success.length > 0) {
            resolve(success);
          } else {
            reject('No device found');
          }
        }).catch((error) => {
          console.log(`[1] Error: ${JSON.stringify(error)}`);
          reject('This device does not support Bluetooth Serial port');
        });
        //ahora los pareados       

      }, fail => {
        console.log(`[2] Error: ${JSON.stringify(fail)}`);
        reject('Bluetooth is disabled');
      });
    });
  }
  /**
   * Busca los dispositivos bluetooth dispositivos al arrastrar la pantalla hacia abajo.
   * @param refresher
   */
  refreshBluetooth(refresher: Refresher) {
    console.log(refresher);
    if (refresher) {
      this.buscarBluetooth().then((successMessage: Array<Object>) => {
        this.devices = [];
        this.devices = successMessage;
        refresher.complete();
      }, fail => {
        this.presentToast(fail);
        refresher.complete();
      });
    }
  }
  /**
   * Verifica si ya se encuentra conectado a un dispositivo bluetooth o no.
   * @param seleccion Son los datos del elemento seleccionado  de la lista
   */
  reviseconnection(seleccion) {
    this.bluetoothSerial.isConnected().then(
      isConnected => {
        let alert = this.alertCtrl.create({
          title: 'Reconnect',
          message: 'Do you want to reconnect?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Accept',
              handler: () => {
                this.disconnecter();
                this.connecter(seleccion.id).then(success => {
                  this.conectadoA = seleccion.name;
                  this.presentToast(success);
                }, fail => {
                  this.conectadoA = "Error in connecting";
                  this.estaConectado = true;
                  this.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
      }, notConnected => {
        let alert = this.alertCtrl.create({
          title: 'Connect',
          message: 'Connect to this device?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked');
              }
            },
            {
              text: 'Accept',
              handler: () => {
                this.connecter(seleccion.id).then(success => {
                  this.conectadoA = seleccion.name;
                  this.estaConectado = true;
                  this.presentToast(success);
                }, fail => {
                  this.conectadoA = "Error occured";
                  this.presentToast(fail);
                });
              }
            }
          ]
        });
        alert.present();
    });
  }
  /**
   * Se conceta a un dispostitivo bluetooth por su id.
   * @param id Es la id del dispositivo al que se desea conectarse
   * @return {Promise<any>} Regresa un message para indicar si se conectó exitosamente o no.
   */
  connecter(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection = this.bluetoothSerial.connect(id).subscribe((data: Observable<any>) => {
        //lo vamos a comentar por mientras
        this.enviarmessages();
        this.setConnectOBD();
      }, fail => {
        console.log(`[3] Error conexión: ${JSON.stringify(fail)}`);
        reject("Can not connect to this device");
      });
    });
  }
  /**
   * Cierra el socket para la conexión con un dispositivo bluetooth.
   */
  disconnecter() {
    if (this.connectionMessages) {
      this.connectionMessages.unsubscribe();
    }
    if (this.connection) {
      this.connection.unsubscribe();
    }
  }

  enviarmessagesI(sms) {
    sms = sms + '\r';
    //this.presentToast('Enviando message: ' + sms);
    this.connectionMessages =this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var obj = this.blueService.parseObdCommand(data);
        if (obj.name && obj.name.length > 0) {
          //this.dataSalida.push(entidad);
          var entidad = {
            Message: sms,
            Mode: obj.mode,
            Pid: obj.pid,
            Name: obj.name,
            Description: obj.description,
            Value: obj.value,
            Minima: obj.min,
            Maxima: obj.max,
            Unit: obj.unit,
            Date: new Date()
          };
          this.dataSalida.push(entidad);
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.connectionMessages.unsubscribe();
      }
      this.message = "";
    });
  }

  setConnectOBD() {
    var btWrite = this.bluetoothSerial;
    btWrite.write('ATZ').then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);});
    btWrite.write('ATL0').then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);});//Turns off extra line feed and carriage return
    btWrite.write('ATS0').then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);});//This disables spaces in in output, which is faster!
    btWrite.write('ATH0').then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);});//Turns off headers and checksum to be sent.
    btWrite.write('ATE0').then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);});//Turns off echo.
    btWrite.write('ATAT2').then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);});//Turn adaptive timing to 2. This is an aggressive learn curve for adjusting the timeout. Will make huge difference on slow systems.
    //Set timeout to 10 * 4 = 40msec, allows +20 queries per second. This is the maximum wait-time. ATAT will decide if it should wait shorter or not.
    //btWrite('ATST0A');
    btWrite.write('ATSP0').then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);});//Set the protocol to automatic.
    this.initiateIntervals();
    //Event connected
    //this.btEventEmit('connected','');
    //btConnected=true;
}

// public btEventEmit = function (event,text) {
//     var pdata={};
//     if (event==='dataReceived') {
//         if ( text.value === 'NO DATA' || text.name === undefined || text.value === undefined) {
//             return;
//         }
//         //pushGlobalLog('New metric for ' + text.name);
//         pdata = {ts:Date.now(),name:text.name,value:text.value};
//         console.log(JSON.stringify(pdata));
        
//         //this.initiateIntervals();
//     }
//     this.initiateIntervals();
// };

  initiateIntervals() {
    //this.bluetoothSerial.write("ATSP0").then(o=>{console.log("protocol", o);}).catch(e=>{console.log("can not set protocol", e);})
    var smsVel = "010D\r";
    var smsTemp = "0105\r";
    var smsRpm = "010C\r";
    var smsFlujo = "0110\r";
    var smsThr = "0111\r";
    console.log("intervl init");



    this.interval = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajes = this.blueService.dataInOut(smsVel).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        console.log('data: velocity', data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objVelocidadActual = this.blueService.velocidadActual;
          this.velocidadActual = parseInt(this.blueService.velocidadActual.Value.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajes.unsubscribe();
        }
      });
    }, 500);

    this.intervalRpm = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesR = this.blueService.dataInOut(smsRpm).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        console.log('data: rpm', data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objRpmActual = this.blueService.rpmActual;
          this.rpmActual = parseInt(this.blueService.rpmActual.Value.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesR.unsubscribe();
        }
      });
    }, 550);

    this.intervalTmp = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesT = this.blueService.dataInOut(smsTemp).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        console.log('data: temparature', data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objTempActual = this.blueService.tempActual;
          this.temperaturaActual = parseInt(this.blueService.tempActual.Value.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesT.unsubscribe();
        }
      });
    }, 650);

    this.intervalFlujo = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesF = this.blueService.dataInOut(smsFlujo).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        console.log('data: fluid', data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objFlujoAireActual = this.blueService.flujoAireActual;
          this.flujoAireActual = parseInt(this.blueService.flujoAireActual.Value.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesF.unsubscribe();
        }
      });
    }, 650);

    this.intervalThrottlepos = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajesTHR = this.blueService.dataInOut(smsThr).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        console.log('data: throttle', data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.objThrottleposActual = this.blueService.throttleposActual;
          this.throttleposActual = parseInt(this.blueService.throttleposActual.Value.toString());
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesTHR.unsubscribe();
        }
      });
    }, 650);
  }

  enviarmessages() {
    var sms = this.message + '\r';
    //this.presentToast('Enviando message: ' + sms);
    this.connectionMessages =this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var obj = this.blueService.parseObdCommand(data);
        if (obj.name && obj.name.length > 0) {
          //this.dataSalida.push(entidad);
          var entidad = {
            Message: sms,
            Mode: obj.mode,
            Pid: obj.pid,
            Name: obj.name,
            Description: obj.description,
            Value: obj.value,
            Minima: obj.min,
            Maxima: obj.max,
            Unit: obj.unit,
            Date: new Date()
          };
          this.dataSalida.push(entidad);
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.connectionMessages.unsubscribe();
      }
      this.message = "";
    });
  }

  /**
 * Presenta un cuadro de message.
 * @param {string} text message a mostrar.
 */
  private presentToast(text: string) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 6000
    });
    toast.present();
  }
  limpiarmessages(){
    this.dataSalida = [];
  }
  


}
