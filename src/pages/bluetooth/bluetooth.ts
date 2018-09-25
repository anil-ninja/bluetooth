import { Component, Injectable } from '@angular/core';
import { IonicPage, Platform, ToastController, AlertController, Refresher, NavController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
//servicio
import { CommunicationService } from '../../app/Service/CommunicationService';
//paginas
import { SeleccionSkinPage } from '../../pages/seleccion-skin/seleccion-skin';


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

  constructor(
    private platform: Platform,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private bluetoothSerial: BluetoothSerial,
    public blueService: CommunicationService,
    public navCtrl: NavController,
  ) { 
    //contenido del cosntructor

  }
  start(){
    //abrir la pagina siguiente a la conexión, cambiar esto despues
    /*
    if (this.estaConectado){
      this.navCtrl.push(SeleccionSkinPage, { usuario: this.estaConectado });
    }
    else{
      this.presentToast('No puede seguir, debe conectarse a un dispositivo bluetooth.');
    }
    */
   this.navCtrl.push(SeleccionSkinPage, { estaConectado: this.estaConectado });
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
        //this.enviarmessages();
        resolve("Connected");
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
      //this.presentToast('data:' + data);
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
   * Permite enviar messages de texto vía serial al conectarse por bluetooth.
   */

   /*
  enviarmessages() {
    var sms = this.message + '\r';
    this.presentToast('Enviando message: ' + sms);
    this.connectionMessages = this.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var obj = this.parseObdCommand(data);
        if (obj.name && obj.name.length > 0) {
          //this.dataSalida.push(entidad);
          var entidad = {
            Modo: obj.mode,
            Pid: obj.pid,
            Nombre: obj.name,
            Descripcion: obj.description,
            Valor: obj.value,
            Minimo: obj.min,
            Maximo: obj.max,
            Unidad: obj.unit,
            Fecha: new Date()
          };
          this.dataSalida.push(entidad);
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          this.presentToast('console log:' + entrada);
        }
      } else {
        this.connectionMessages.unsubscribe();
      }
      this.message = "";
    });
  }
*/
    /**
   * Permite enviar messages de texto vía serial al conectarse por bluetooth.
   */
  enviarmessages() {
    var sms = this.message + '\r';
    //this.presentToast('Enviando message: ' + sms);
    this.connectionMessages =this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
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
