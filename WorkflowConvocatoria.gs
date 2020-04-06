/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - funcionalidad para llevar a cabo un workflow con el que completar el  *
    envio de la convocatoria del check-i                                  *
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



/*** LISTADO DE FUNCIONES:
 ------------------------------
 + comenzarWorkflowConvocatoria: * Inicia el workflow cargando un flujo de acciones a ser realizadas
 + cargarPantallaWorkflow: * Cargamos una ventana auxiliar que ayudara en la ejecución del workflow de la convocatoria
 + nextAccion: * funcion que rescata del flujo de acciones, la primera para ser ejecutada y deja el resto para ser ejecutadas la proxima vez
 + iniciarComunicaciones:  * funcion del flujo de acciones del workflow que indica que se iniciaran las comunicaciones
 + obtenerFichero: * funcion del flujo de acciones del workflow que indica al usuario que especifique el archivo que corresponda a las caracteristicas indicada por tipo_fichero 
 + salvarArchivoDefinitivo:  * Permite salvaguardar un archivo subido a drive como ficheros de caracteristicas tipo_fichero 
 + mandarConvocatoria:  * Funcionalidad para lanzar la convocatoria del check-in
***/



/****************************************************************************************************
 * Inicia el workflow cargando un flujo de acciones a ser realizadas
 
 * @param {Date} fecha_limite_test    fecha máxima para contestar el test que se comunicara al usuario receptor de la convocatoria
 * @param {boolean} is_solo_seleccionados   filtro para seleccionar los destinatarios de la convocatoria
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function comenzarWorkflowConvocatoria(fecha_limite_test,is_solo_seleccionados) {
  var logging=new Logging('MANUAL(Enviar Mail comenzarWorkflowConvocatoria)');
  var this_sheet = new ThisSheet();
  
  //solo iniciamos Inscritos para que salten las excepciones si estan mal formados
            var inscritos = new Inscritos();
  
  //guardamos los parametros porque a continuación vamos a iniciar un workflow y es la unica forma de perseverarlo
            var document_properties = PropertiesService.getScriptProperties();       
            document_properties.setProperty('FECHA_PROPUESTA',fecha_limite_test.toDateString());     
            document_properties.setProperty('SOLO_SELECCIONADOS',JSON.stringify(is_solo_seleccionados?true:false));
  
  //mensaje alertando al usuario de que debe tener el buzon de una geografía configurado para poder enviar mensajes desde su cuenta
            var response = SpreadsheetApp.getUi().alert('Recuerda que debes añadir como alias a tu correo el buzon del pais "'+this_sheet.getPais().getNomenclaturaFicheros()+'" ('+this_sheet.getPais().getDireccionBuzon()+') para mandar el mail de convocatoria con esa direccion. \n\n¿La tienes así configurada?',SpreadsheetApp.getUi().ButtonSet.YES_NO)
            if (response == SpreadsheetApp.getUi().Button.YES) 
              Logger.log('The user clicked "ok."');
            else 
              throw 'Se ha parado la ejecución porque se ha indicado que no esta configurado el buzon el pais: "'+this_sheet.getPais().getNomenclaturaFicheros()+'" ('+this_sheet.getPais().getDireccionBuzon()+')';
  
  //vaciamos la variable que contendra los archivos subidos por el usuario 
            document_properties.setProperty('ARCHIVOS_SOLICITADOS','');
  
  //comprobamos si existe el documento PDF por haberse mandado ya la convocatoria otras veces
            var existe_detalle_curso;
            try
            { existe_detalle_curso=this_sheet.getDetalleCurso();   }
            catch (error)
            {existe_detalle_curso=false;}

  //el workflow será:
  // ** permitir al usuario que inserte la imagen relacionada con la postal que enlaza con el pdf
  // ** salvar el archivo y permitir al usuario que inserte la imagen relacionada con la postal que enlaza con el formulario
  // ** salvar el archivo y permitir al usuario que inserte el pdf detalle de curso (si neceario)
  // ** salvar el archivo y indicarle que se procederá a mandar las convocatorias
  // ** mandar las convocatorias
              document_properties.setProperty('NEXT_ACCION',
                    '["obtenerFichero(\'PNG-postal1-enlace_pdf\')",'+
                      '"salvarArchivoDefinitivo (\'PNG-postal1-enlace_pdf\');obtenerFichero(\'PNG-postal2-enlace_formulario\')",'+
                      ((!existe_detalle_curso)?
                            '"salvarArchivoDefinitivo (\'PNG-postal2-enlace_formulario\');obtenerFichero(\'PDF-detalle_curso\')","salvarArchivoDefinitivo (\'PDF-detalle_curso\');iniciarComunicaciones()",'
                            :'"salvarArchivoDefinitivo (\'PNG-postal2-enlace_formulario\');iniciarComunicaciones()",')+
                      '"mandarConvocatoria()"]');
          
  //cargamos la ventana de workflow
            cargarPantallaWorkflow();
}


/****************************************************************************************************
 * Cargamos una ventana auxiliar que ayudara en la ejecución del workflow de la convocatoria
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function cargarPantallaWorkflow() {
  var html = HtmlService.createHtmlOutputFromFile('ExaminadorDrive.html')
  .setWidth(600)
  .setHeight(425)
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi().showModalDialog(html, 'Acceso a Google Drive para subir archivos');
}


/**
* Gets the user's OAuth 2.0 access token so that it can be passed to Picker.
* This technique keeps Picker from needing to show its own authorization
* dialog, but is only possible if the OAuth scope that Picker needs is
* available in Apps Script. In this case, the function includes an unused call
* to a DriveApp method to ensure that Apps Script requests access to all files
* in the user's Drive.
*
* @return {string} The user's OAuth 2.0 access token.
*/
function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}



/****************************************************************************************************
 * funcion que rescata del flujo de acciones, la primera para ser ejecutada y deja el resto para ser ejecutadas la proxima vez
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function nextAccion()
{
  var document_properties = PropertiesService.getScriptProperties();
  //recuperamos el workflow de acciones
  var accionesEncadenadas=JSON.parse(document_properties.getProperty('NEXT_ACCION'));
  //recuperamos la primera accion del workflow
  var fun= accionesEncadenadas.shift();
  //actualizamos el workflow de acciones con el resto de acciones pendientes
  document_properties.setProperty('NEXT_ACCION',JSON.stringify(accionesEncadenadas));
  //ejecutamos la accion rescatada
  return eval(fun);
}


/****************************************************************************************************
 * funcion del flujo de acciones del workflow que indica que se iniciaran las comunicaciones
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function iniciarComunicaciones()
{
  return {generando_comunicaciones:true};
}

/****************************************************************************************************
 * funcion del flujo de acciones del workflow que indica al usuario que especifique el archivo que corresponda a las caracteristicas indicada por tipo_fichero 
 
 * @param {String} tipo_fichero    Caracteristicas de un fichero que se utilizará para generar la convocatoria
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function obtenerFichero(tipo_fichero)
{
  return {fichero_pendiente:tipo_fichero};
}

/****************************************************************************************************
 * Permite salvaguardar un archivo subido a drive como ficheros de caracteristicas tipo_fichero 
 
 * @param {String}   tipo_fichero   Caracteristicas de un fichero que se utilizará para generar la convocatoria
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function salvarArchivoDefinitivo (tipo_fichero)
{
  var document_properties = PropertiesService.getScriptProperties();       
  var archivos_solicitados = JSON.parse(document_properties.getProperty('ARCHIVOS_SOLICITADOS')||'{}');
  archivos_solicitados[tipo_fichero]=document_properties.getProperty('ARCHIVO_TEMPORAL_ID');
  document_properties.setProperty('ARCHIVOS_SOLICITADOS',JSON.stringify(archivos_solicitados));
}

/****************************************************************************************************
 * Funcionalidad para lanzar la convocatoria del check-in
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function mandarConvocatoria()
{
  var logging=new Logging('MANUAL(Enviar Mail Convocatoria)');
  
  try{
    
    
    var document_properties = PropertiesService.getScriptProperties();       
    //rescatamos los ficheros indicados durante las tareas previas en el workflow
    var archivos_solicitados = JSON.parse(document_properties.getProperty('ARCHIVOS_SOLICITADOS'));  
    //Logger.log('get ARCHIVOS_SOLICITADOS'+JSON.stringify(archivos_solicitados));
    //rescatamos los parametros con los que se llamo inicialemnte el workflow
    var fecha_limite_test= new Date(document_properties.getProperty('FECHA_PROPUESTA'));     
    var is_solo_seleccionados=JSON.parse(document_properties.getProperty('SOLO_SELECCIONADOS'));  
    
    
    var inscritos = new Inscritos();
    var this_sheet = new ThisSheet();
    
    //obtenemos los test iniciales que ya existen
    var form =this_sheet.getFormulariosTestInicial();
    
    //determinamos los grupos existentes a partir de los ids de los inscritos
    var grupos={};
    for (var i=0;i<inscritos.getNumElementos();i++)
    {
      if (!inscritos.getElemento(i).isStatusBaja() 
          && (!is_solo_seleccionados || (is_solo_seleccionados && inscritos.getElemento(i).isStatusSeleccionado())))
      grupos[parseInt(inscritos.getElemento(i).getTestId())]=([inscritos.getElemento(i)]).concat(grupos[parseInt(inscritos.getElemento(i).getTestId())]||[]);
    }
    //Logger.log("mandarMailConvocatoria] grupos.length="+JSON.stringify(Object.keys(grupos)))
    
    //comprobacion que para todos los grupos existe su formulario y si no se crea
    Object.keys(grupos)
    .filter(function (item){return this.indexOf(item)<0;},Object.keys(form))
    .forEach(function(item){this[item]=generarTestConvocatoria(item);},form);
    //Logger.log('mandarMailConvocatoria] form '+JSON.stringify(form));
    //Logger.log('mandarMailConvocatoria] form '+JSON.stringify(grupos));
    
    
    //accedemos a los archivos que se usarán para enviar la convocatoria
    var pdf_drive=null;
    var postal1_drive = DriveApp.getFileById(archivos_solicitados['PNG-postal1-enlace_pdf']);
    var postal2_drive = DriveApp.getFileById(archivos_solicitados['PNG-postal2-enlace_formulario']);
    if (archivos_solicitados['PDF-detalle_curso'])
    {
      pdf_drive= DriveApp.getFileById(archivos_solicitados['PDF-detalle_curso']);
      this_sheet.setDetalleCurso(pdf_drive);
      DriveApp.getRootFolder().removeFile(pdf_drive);
      //dar permisos para que pueda acceder cualquiera con el enlace
      pdf_drive.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW)
    }
    else
      pdf_drive=this_sheet.getDetalleCurso();
    
    //mandamos la convocatoria
    var comunicaciones = new Comunicaciones();
    for (var grupo in grupos)
      comunicaciones.mandarConvocatoria(grupos[grupo], 
                    pdf_drive,postal1_drive,
                    postal2_drive,
                    FormApp.openById(form[grupo].getId()),
                    fecha_limite_test);
    
    //eliminar imagenes una vez ya hecho los envíos
    DriveApp.getRootFolder().removeFile(postal1_drive);
    DriveApp.getRootFolder().removeFile(postal2_drive);
    
    var logging=new Logging('MANUAL(Enviar Mail Convocatoria)');
    logging.newEventTexts('Correcto',
      'Se ha mandado la convocatoria a '+((is_solo_seleccionados)?'solo los seleccionados':'todos los inscritos')+
      ' ('+
        Object.keys(grupos).reduce(function (previous, key) {return previous + grupos[key].length;}, 0)+
          ') con limite para responder el '+fecha_limite_test.toLocaleString());
    
  }
  catch (error)
  {
    try
    {
      var postal1_drive = DriveApp.getFileById(archivos_solicitados['PNG-postal1-enlace_pdf']);
      DriveApp.getRootFolder().removeFile(postal1_drive);
    }catch (error){}
    try
    {
      var postal2_drive = DriveApp.getFileById(archivos_solicitados['PNG-postal2-enlace_formulario']);
      DriveApp.getRootFolder().removeFile(postal2_drive);
    }catch (error){}
    try
    {
      var pdf_drive= DriveApp.getFileById(archivos_solicitados['PDF-detalle_curso']);
      DriveApp.getRootFolder().removeFile(pdf_drive);
    }catch (error){}
    logging.newEventTexts('ERROR durante la ejecución',error);
    //propagamos el error
    throw error;
  }
}

//FUNCIONES AUXILIARES PARA SALVAGUARDAR EN LA SESION LOS IDS DE LOS FICHEROS SUBIDDOS Y EL WORKFLOW
function salvarArchivoTemporal (id)
{
  var document_properties = PropertiesService.getScriptProperties();
  document_properties.setProperty('ARCHIVO_TEMPORAL_ID', id);
}




