/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - clase que encapsula la forma de envío de los diferentes correos y su  *
*   formato                                                               *
*                                                                         *
* TODO                                                                    *
* ====                                                                    *
* - .....                                                                 *
* ----------------------------------------------------------------------- *
* This program is not free software; you can not : (a) copy or use the    *
* Software in any manner except as expressly permitted by SynergicPartners*
* (b) transfer, sell, rent, lease, lend, distribute, or sublicense the    *
* Software to any third party; (c)  reverse engineer, disassemble, or     *
* decompile the Software; (d) alter, modify, enhance or prepare any       *
* derivative work from or of the Software; (e) redistribute it and/or     *
* modify it without prior, written approval from Synergic Partners.       *
\***************************************************************************/



/*** LISTADO DE FUNCIONES de la clase Comunicaciones:
 ------------------------------
 + enviarRecordatorioTestInicial
 + mandarResultadoApto
 + mandarResultadoNoApto
 + mandarResultadoNoValido
 + mandarRevalida
 + enviarRecordatorioRevalida
 + mandarConvocatoria
 + mandarCorreoCheckOut
***/


function Comunicaciones()
{


  if (typeof Comunicaciones.instancia === 'object') {
        return Comunicaciones.instancia;
    }

  Comunicaciones.instancia = this;
  //imagen cabecera del correo
  this._postal_blob = DriveApp.getFileById('1c5icGsDz0ge_o-fNJZw6HP0R0s6tOIUK').getBlob().setName("postal");

  //obtenemos la referencia a la clase que tiene los mensajes que van a ir en el correo
  this._mensajes = Mensajes.getInstancia();
  //obtenemos la referencia a la clase que maneja los paises y los buzones
  this._pais = (new ThisSheet()).getPais();

  //mandar un correo con remite una direccion de correo de buzon de pais REQUIERE TENERLO CONFIGURADO EN LA CUNTA PERSONAL COMO ALIAS
  this._enviarMailDesdeBuzonPais=function(to, options,text)
  {

    //Logger.log('_enviarMail] empieza mandarMail a '+to+' sobre: '+text)

    options.name=this._pais.getNombreEmisor();
    options.from=this._pais.getDireccionBuzon();

    GmailApp.sendEmail(to, this._mensajes.getAsuntoEmail(), text,options);

  }
  //mandar un correo con remite una direccion de correo personal
  this._enviarMailDesdeBuzonPersonal=function(to, asunto,options,text)
  {

    GmailApp.sendEmail(to, asunto, text,options);

  }

  //dar stylo al correo en funcion de unas directrices
  this._addHTMLStyle=function (mensaje)
  {

    //Logger.log('MENSAJE A FORMATEAR: '+mensaje)
    //cambiar cada salto de linea \n por parrafos <p>
    var mensaje_HTML="",cadena=mensaje;
    while (cadena && cadena.length!=0)
    {

      var res = /^([^\n]+)\n/.exec(cadena);
        Logger.log(JSON.stringify(res))
        mensaje_HTML=mensaje_HTML+"<p>"+res[1]+"</p>";
      cadena=cadena.substr(res[0].length);
    }
    mensaje=mensaje_HTML;

    //cambiar <r> por resaltes de estilo <span style="color:rgb(61,133,198);font-weight:700;">
    mensaje=mensaje.replace(/<r>/g,'<span style="color:rgb(61,133,198);font-weight:700;">');
    mensaje=mensaje.replace(/<\/r>/g,'</span>');

    //cambiar <b> por resaltes de estilo <span style="font-weight:700;">
    mensaje=mensaje.replace(/<b>/g,'<span style="font-weight:700;">');
    mensaje=mensaje.replace(/<\/b>/g,'</span>');

    //añadir stilo a las listas <u>


    //añadir imagen this._postal_blob
    mensaje='<p><img src="cid:'+this._postal_blob.getName()+'" width="602" height="72" style="border:none"></p>'
            +mensaje;

    //estilo general font-size:12pt;color:rgb(7,55,99);font-family:Arial;
    return '<div style="font-size:12pt;color:rgb(7,55,99);font-family:Arial;">'+mensaje+'</div>';

  }

  this.enviarRecordatorioTestInicial=function(participantes,pdf_detalle,formulario,fecha_limite)
  {
         var to=participantes.map(function(participante){return participante.getEmail();});
         var text=this._mensajes.getMensajeEmailRecordatorioTXT(pdf_detalle,formulario,fecha_limite);

         var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailRecordatorio(pdf_detalle,formulario,fecha_limite)),
                      bcc :to.join(","),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    }
               };


      this._enviarMailDesdeBuzonPais(this._pais.getDireccionBuzon(),options,text);
  }


  this.mandarResultadoApto=function(participante)
  {
         var text=this._mensajes.getMensajeEmailResultadoAptoTXT(participante);

         var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailResultadoApto(participante)),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    }
               };


      this._enviarMailDesdeBuzonPais(participante.getEmail(),options,text);
  }


  this.mandarResultadoNoApto=function(participante,fecha_revalida)  {
         var file = DriveApp.getFileById('18xshNNrnZjqiSVL2yvgQ5lpvXqQu0lQB');
         var enviarPDF = false;
         participante.getPlanDeChoque().map(function(capabilities){
            if (capabilities._nombre == 'Estadística'){
              enviarPDF = true;
            };
         })

         if(enviarPDF){
              var text=this._mensajes.getMensajeEmailResultadoNoAptoPDFTXT(participante,fecha_revalida);
              var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailResultadoNoAptoPDF(participante,fecha_revalida)),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    } ,
                      attachments: [file.getAs(MimeType.PDF)]
               };

               this._enviarMailDesdeBuzonPais(participante.getEmail(),options,text);
           }else{
              var text=this._mensajes.getMensajeEmailResultadoNoAptoTXT(participante,fecha_revalida);
              var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailResultadoNoApto(participante,fecha_revalida)),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    }
               };

               this._enviarMailDesdeBuzonPais(participante.getEmail(),options,text);
         }
  }

  this.mandarResultadoNoValido=function(participante)
  {
         var text=this._mensajes.getMensajeEmailResultadoNoValidoTXT(participante);

         var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailResultadoNoValido(participante)),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    }
               };


      this._enviarMailDesdeBuzonPais(participante.getEmail(),options,text);
  }

  this.mandarRevalida=function(participante,fecha_limite_revalida,tests_revalida)
  {
         var text=this._mensajes.getMensajeEmailRevalidaTXT(participante,fecha_limite_revalida,tests_revalida);

         var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailRevalida(participante,fecha_limite_revalida,tests_revalida)),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    }
               };


      this._enviarMailDesdeBuzonPais(participante.getEmail(),options,text);
  }

  this.enviarRecordatorioRevalida=function(participante,fecha_limite_revalida,tests_revalida)
  {
         var text=this._mensajes.getMensajeEmailRecordatorioRevalidaTXT(participante,fecha_limite_revalida,tests_revalida);

         var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailRecordatorioRevalida(participante,fecha_limite_revalida,tests_revalida)),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    }
               };


      this._enviarMailDesdeBuzonPais(participante.getEmail(),options,text);
  }


  this.mandarConvocatoria=function (array_inscritos, pdf_drive,postal1_drive,postal2_drive,formulario, fecha_limite_test)
  {

      var postal1_blob = postal1_drive.getBlob().setName("postal1");
      var postal2_blob = postal2_drive.getBlob().setName("postal2");

          var text=this._mensajes.getMensajeEmailConvocatoriaTXT(pdf_drive,formulario, fecha_limite_test);
          var options=
              {
                htmlBody: "<div><a href='"+pdf_drive.getUrl()+"'><img src='cid:postal1'> </a></div>" +
                "<div><a href='"+formulario.getPublishedUrl()+"'><img src='cid:postal2'> </a></div>",
                bcc :array_inscritos.map(function(item){return item.getEmail();}).join(","),
                inlineImages:
                  {
                  postal1: postal1_blob,
                  postal2: postal2_blob
                  }
                }
        this._enviarMailDesdeBuzonPais(this._pais.getDireccionBuzon(),options, text);

  }



  this.mandarCorreoCheckOut=function (evaluados,link_formulario)
    {
         var this_sheet=new ThisSheet();
         var text=this._mensajes.getMensajeEmailCheckoutTXT(link_formulario);

         var options=
                {
                      htmlBody:this._addHTMLStyle(this._mensajes.getMensajeEmailCheckout(link_formulario)),
                      inlineImages:
                      {
                      postal: this._postal_blob
                    }
               };
        this._enviarMailDesdeBuzonPersonal(evaluados.join(','), this._mensajes.getAsuntoEmail()+' | Check-out',options, text);
  }

}


function pruebaComunicaciones()
{
  var comunicaciones= new Comunicaciones();
  comunicaciones.mandarRevalida({getNombre:function(){return 'borja';},getEmail:function(){return 'borja.duran.contractor@bbva.com';}},new Date(),[{capability:'Google Script',link:'http://www.google.es'}])

}