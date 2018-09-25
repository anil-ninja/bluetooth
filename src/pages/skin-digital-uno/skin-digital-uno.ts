import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Observable } from 'rxjs';
import { ISubscription } from "rxjs/Subscription";
//nuevos
import { of } from 'rxjs/observable/of';
import { interval } from 'rxjs/observable/interval';
import { delay } from 'rxjs/operators';

//servicio
import { CommunicationService } from '../../app/Service/CommunicationService';

/**
 * Generated class for the SkinDigitalUnoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-skin-digital-uno',
  templateUrl: 'skin-digital-uno.html',
})
export class SkinDigitalUnoPage {
  estaConectado = false;
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
    public navCtrl: NavController, 
    public navParams: NavParams,
    private bluetoothSerial: BluetoothSerial,
    public blueService: CommunicationService,
    private platform: Platform
  ) {
    this.estaConectado = navParams.get('estaConectado');
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

    this.platform.ready().then(() => {
      //iniciamos
      //this.iniciarIntervalo();
      this.iniciarIntervaloDos();
      //this.getMultiValueObservableVel();
    });
  }
  //nuevos observables
  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    if (this.intervalRpm) {
      clearInterval(this.intervalRpm);
    }
    if (this.intervalTmp) {
      clearInterval(this.intervalTmp);
    }
    if (this.intervalFlujo) {
      clearInterval(this.intervalFlujo);
    }
    if (this.intervalThrottlepos) {
      clearInterval(this.intervalThrottlepos);
    }
  }
  getMultiValueObservableVel() {
    var smsVel = "010D\r";
    this.conexionMensajes =this.blueService.dataInOutVel(smsVel).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        //var obj = this.blueService.parseObdCommand(data);
        this.blueService.parseObdCommand(data);
        this.velocidadActual = this.blueService.velocidadActual.Value;
      }
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
    });
  }

  //******************** */
  iniciarIntervaloDos() {
    var smsVel = "010D\r";
    var smsTemp = "0105\r";
    var smsRpm = "010C\r";
    var smsFlujo = "0110\r";
    var smsThr = "0111\r";

    this.interval = setInterval(() => {
      //this.checkUpdate();
      this.conexionMensajes = this.blueService.dataInOut(smsVel).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
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
        //this.presentToast('data:' + data);
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
        //this.presentToast('data:' + data);
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
        //this.presentToast('data:' + data);
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
        //this.presentToast('data:' + data);
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
  iniciarIntervalo() {
    var smsVel = "010D\r";
    var smsTemp = "0105\r";
    var smsRpm = "010C\r";
    //consulta a la velocidad
    Observable.interval(500).subscribe(() => {
      this.conexionMensajes =this.blueService.dataInOut(smsVel).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.velocidadActual = this.blueService.velocidadActual.Value;
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajes.unsubscribe();
        }
      });
    });
    //consulta rpm
    Observable.interval(501).subscribe(() => {
      this.conexionMensajesT = this.blueService.dataInOut(smsRpm).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.rpmActual = this.blueService.rpmActual.Value;
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesT.unsubscribe();
        }
      });
    });
    //consulta temp
    Observable.interval(600).subscribe(() => {
      this.conexionMensajesR = this.blueService.dataInOut(smsTemp).subscribe(data => {
        let entrada = data.substr(0, data.length - 1);
        //this.presentToast('data:' + data);
        if (data && data.length > 0) {
          //var obj = this.blueService.parseObdCommand(data);
          this.blueService.parseObdCommand(data);
          this.temperaturaActual = this.blueService.tempActual.Value;
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesR.unsubscribe();
        }
      });
    });
    /*
    Observable.interval(3000).subscribe(() => {
      this.conexionMensajesT =this.blueService.dataInOut(smsT).subscribe(dataT => {
        let entrada = dataT.substr(0, dataT.length - 1);
        //this.presentToast('data:' + data);
        if (dataT && dataT.length > 0) {
          var obj = this.blueService.parseObdCommand(dataT);
          if (obj.name && obj.name.length > 0) {
            //this.dataSalida.push(entidad);
            var retorno = {
              Mensaje: sms,
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
            this.temperaturaActual = retorno.Value;
          }
          
        }
        if (entrada != ">") {
          if (entrada != "") {
            console.log(`Entrada: ${entrada}`);
          }
        } else {
          this.conexionMensajesT.unsubscribe();
        }
      });
    });
    
    Observable.interval(600).subscribe(() => {
      this.enviarMensajesI(smsR);
      this.flujoAireActual = = this.entidadConsultar.Value;
    });
    */
  }
  enviarMensajesI(sms) {
    sms = sms + '\r';
    //this.presentToast('Enviando mensaje: ' + sms);
    this.conexionMensajes =this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        var obj = this.blueService.parseObdCommand(data);
        if (obj.name && obj.name.length > 0) {
          //this.dataSalida.push(entidad);
          var retorno = {
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
          return retorno;
          //this.velocidadActual = entidad.Value;
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      //this.mensaje = "";
    });
  }
  enviarMensajesR(sms) {
    sms = sms + '\r';
    this.conexionMensajes = this.blueService.dataInOut(sms).subscribe(data => {
      let entrada = data.substr(0, data.length - 1);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      //this.presentToast('data:' + data);
      if (data && data.length > 0) {
        return data;
      }
    });
  }
  enviarMensajesT(sms) {
    sms = sms + '\r';
    //this.presentToast('Enviando mensaje: ' + sms);
    this.conexionMensajes =this.blueService.dataInOut(sms).subscribe(dataT => {
      let entrada = dataT.substr(0, dataT.length - 1);
      //this.presentToast('data:' + data);
      if (dataT && dataT.length > 0) {
        var objT = this.blueService.parseObdCommand(dataT);
        if (objT.name && objT.name.length > 0) {
          //this.dataSalida.push(entidad);
          var entidadT = {
            Message: sms,
            Mode: objT.mode,
            Pid: objT.pid,
            Name: objT.name,
            Description: objT.description,
            Value: objT.value,
            Minima: objT.min,
            Maxima: objT.max,
            Unit: objT.unit,
            Date: new Date()
          };
          this.temperaturaActual = entidadT.Value;
        }
      }
      //this.presentToast('variable salida: ' + entrada);
      if (entrada != ">") {
        if (entrada != "") {
          console.log(`Entrada: ${entrada}`);
          //this.presentToast('console log:' + entrada);
        }
      } else {
        this.conexionMensajes.unsubscribe();
      }
      //this.mensaje = "";
    });
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad SkinDigitalUnoPage');
  }
  goBack() {
    this.navCtrl.pop();
    //console.log('Click on button Test Console Log');
 }

}
