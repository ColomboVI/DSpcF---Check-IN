/**********************************************
 PLANTILLA DATA SPECIALIST FUNDAMENTALS (DSpcF) -- ID 88-260088-DSPCF
***********************************************/

/**************************************************************************\
 * Copyright (C) 2018 by Synergic Partners                                 *
 *                                                                         *
 * author     : Borja Durán                                                *
 * description:                                                            *
 * - creacion del menu personalizado 'Gestion de check-in'                 *
 * - se enlaza cada submenu con la operación a realizar                    *
 * - .....                                                                 *
 * - .....                                                                 *
 * - .....                                                                 *
 * - .....                                                                 *
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
 + onOpen: * Configura el menu 'Gestion de check-in' con una serie de submenus que lanzan unas tareas
 + isSoloSelececcionadosDialog: * Genera un mensaje de atención al usuario para que decida si realizar la accion a todos los inscritos o solo los seleccionados.
 + getValidDateDialogAfterToday: * Genera un mensaje de atención al usuario para que indique una fecha que sea >= a la presente(HOY). 
 + iniciarCheckIn: * Engloba todas las acciones a realizar en el lanzamiento del check-in
 + enerarTestConvocatoriaUI: * Para un formulario asociado a un grupo, si no existe lo genera y las hojas de correccion asociadas 
 + comenzarWorkflowConvocatoriaUI:  * Lanzar el workflow para mandar la convocatoria al check-in
 + recopilarRespuestasUI:  * Lee las respuestas a los formularios de TEST INICIAL creados 
 + mandarRecordatorioConFechaLimiteUI:  * Para un formulario asociado a un grupo, si no existe lo genera y las hojas de correccion asociadas 
 + mandarResultadosUI: * Acciona el envío de los resultados del TEST INICIAL
 + aplicarPlanificacionUI:  * Generar los triggers de envios de mensajes automaticos según la planificación indicada en la hoja
 + generarTestRevalidaUI: * Generar el test de REVALIDA especifico para un grupo y una materia, que serán preguntadas al usuario 
 + lanzarRevalidaUI:  * Lanza la REVALIDA para aquellos que deban realizarlo 
 + mandarRecordatorioRevalidaUI:  * Lanza un recordatorio para aquellos que deban hacer la revalida y no lo hayan completado 
 + leerRespuestasRevalidaUI:  * Lee las respuestas a los formularios de REVALIDA creados 
 + generarExcelResultados:  * Para un formulario asociado a un grupo, si no existe lo genera y las hojas de correccion asociadas 
***/



/****************************************************************************************************
 * Configura el menu 'Gestion de check-in' con una serie de submenus que lanzan unas tareas
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function onOpen() {

  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Gestion de check-in')
      .addItem('Iniciar Check In', 'iniciarCheckIn')
      .addSubMenu(SpreadsheetApp.getUi().createMenu('Subtareas')
//        .addItem('Generar Tests Convocatoria', 'generarTestConvocatoriaUI')
        .addItem('Enviar Mail Convocatoria', 'comenzarWorkflowConvocatoriaUI')
        .addItem('Leer respuestas Test Convocatoria', 'recopilarRespuestasUI')
        .addItem('Enviar Recodatorio Test Convocatoria', 'mandarRecordatorioConFechaLimiteUI')
        .addItem('Enviar Resultados Test Convocatoria', 'mandarResultadosUI')
        .addSeparator()
//        .addItem('Generar Tests Revalida', 'generarTestRevalidaUI')
        .addItem('Enviar Revalida', 'lanzarRevalidaUI')
        .addItem('Enviar Recodatorio Revalida', 'mandarRecordatorioRevalidaUI')
        .addItem('Leer Respuestas Revalida', 'leerRespuestasRevalidaUI')
//        .addSeparator()
//        .addItem('Generar Excel Resultados', 'generarExcelResultados')
      )
      .addToUi();      
}



/****************************************************************************************************
 * Genera un mensaje de atención al usuario para que decida si realizar la accion a todos los inscritos o solo los seleccionados.
 * @param NINGUNO
 * @returns {boolean}         true si ha seleccionado realizar la accion a solo los seleccionados
 * @exception NINGUNO

 *****************************************************************************************************/
 function isSoloSelececcionadosDialog()
{
  return (SpreadsheetApp.getUi().alert('Esta acción implica una comunicación a los inscritos al programa.\n\n'+
                         '# Presionando el boton OK mandarás el mensaje sólo a aquéllos que hayan sido seleccionados en la columna STATUS.\n\n'+
                         '# Presionando el boton CANCELAR mandarás el mensaje todos aquéllos cuyo STATUS no sea Baja.\n',SpreadsheetApp.getUi().ButtonSet.OK_CANCEL))== SpreadsheetApp.getUi().Button.OK;
}



/****************************************************************************************************
 * Genera un mensaje de atención al usuario para que indique una fecha que sea >= a la presente(HOY). 
 * En caso de que @param fecha_defecto sea >= que HOY, el usuario puede no indicar ninguna acordando que le parece válida la fecha propuesta
 
 * @param {String} titulo  titulo principal que aparecerá en la ventana de atención al usuario que pregunta por la fecha
 * @param {Date} fecha_defecto  fecha por defecto que se le ofrecerá al usuario
 * @returns {Date}         la fecha que el usuario ha indicado o fecha_defecto 
 * @exception NINGUNO
 
 *****************************************************************************************************/
function getValidDateDialogAfterToday(titulo, fecha_defecto)
{
      var ui=SpreadsheetApp.getUi();
      var response_pregunta_fecha,today=new Date(),fecha_propuesta=null;
      today=new Date(today.toDateString());
      while(fecha_propuesta<today)
      {
        response_pregunta_fecha = ui.prompt(
                                    titulo,
                                    (fecha_defecto<today)?
                                      'Indique una fecha (igual o posterior a HOY) a continuación en formato AAAA/MM/DD:'
                                      :('La fecha original es: '+fecha_defecto.getYear()+'/'+(fecha_defecto.getMonth()+1)+'/'+fecha_defecto.getDate()+
                                          '.\r\nSi se prefiere una fecha diferente (igual o posterior a HOY), indicala a continuación en formato AAAA/MM/DD:'),
                                    ui.ButtonSet.OK_CANCEL);
        if (response_pregunta_fecha.getSelectedButton()== ui.Button.CANCEL)
          throw 'El usuario ha cancelado la acción.'
        else if (/^(\d\d\d\d\/\d?\d\/\d?\d)?$/.test(response_pregunta_fecha.getResponseText().trim()))
          fecha_propuesta= new Date(response_pregunta_fecha.getResponseText()||fecha_defecto);
        //Logger.log('establecerFechaRevalidaUI] The user\'s said %s.', response_pregunta_fecha.getResponseText()+' '+fecha_propuesta);
      }
      return fecha_propuesta;
}


/****************************************************************************************************
 * Engloba todas las acciones a realizar en el lanzamiento del check-in
 * - planificar las acciones automaticas 
 * - enviar el mensaje de convocatoria 
 * - generar el excel de resultados
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function iniciarCheckIn() {
    var logging= new Logging('MANUAL(Iniciar Check In)');
    try
    {
      //iniciación de todos los valores asociados al curso
          var this_sheet=new ThisSheet();
      //mensaje de confirmación de lanzamiento del check-in
          var response = SpreadsheetApp.getUi().alert('Vas a la lanzar el check in para el siguiente programa:\n'+
                    '# Programa: '+this_sheet.getPrograma().getNombre()+'\n'+
                    '# Pais: '+this_sheet.getPais().getNombre()+'\n'+
                    '# Q#: '+this_sheet.getQ()+'\n'+
                    '# Fecha inicio: '+this_sheet.getFechaIni().toLocaleDateString()+'\n'
                    ,SpreadsheetApp.getUi().ButtonSet.OK_CANCEL)

      //El usuario acepta las condiciones de lanzamiento
            if (response == SpreadsheetApp.getUi().Button.OK)
              logging.newEventTexts('Check-in iniciado','Los valores de configuracion del Check-in son:'+
                                    '[Programa:'+this_sheet.getPrograma().getNombre()+'],[Pais:'+this_sheet.getPais().getNombre()+'],[Q#:'+this_sheet.getQ()+'],[Fecha Inicio:'+this_sheet.getFechaIni().toLocaleDateString()+'].');
      //El usuario cancela el lanzamiento
            else
              throw 'Se ha parado la ejecución porque no se consideradon válidas los valores de configuracion del Check-in '+
                '[Programa:'+this_sheet.getPrograma().getNombre()+'],[Pais:'+this_sheet.getPais().getNombre()+'],[Q#:'+this_sheet.getQ()+'],[Fecha Inicio:'+this_sheet.getFechaIni().toLocaleDateString()+'].';

      //planificamos una serie de triggers que recogeran las respuestas de los formularios y lo integraran en el excel de moniotirzacion y el envio de resultados
            aplicarPlanificacion();
      //mandar mail de convocatoria
            comenzarWorkflowConvocatoria(this_sheet.getFechaLimiteTest());      
      //generar carpeta resultados y generar excel para obtener resultados
            generarExcelResultados();
    }
    catch (error)
    {
        //eliminamos los posibles trigger que se hayan creado
        stop_trigger_resultado_revalida();
        stop_trigger_recordatorio_limite_revalida();
        stop_trigger_lanzamiento_revalida();
        stop_trigger_resultados();
        stop_trigger_recodatorio_limite();
        stop_trigger_recordatorio_intermedio();
        
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Para un formulario asociado a un grupo, si no existe lo genera y las hojas de correccion asociadas 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function generarTestConvocatoriaUI()
{
  var logging= new Logging('MANUAL(Generar Tests Convocatoria)');
  var ui=SpreadsheetApp.getUi();
  try
  {
    //obtenemos los formularios creados actualmente
        var form =(new ThisSheet()).getFormulariosTestInicial();
        //Logger.log(JSON.stringify(Object.keys(form)));
    
    //preguntamos al usuario para que id grupo quiere crear un formulario
        var  response_id = ui.prompt('Creando test para el grupo...','Especifica para que grupo (id test) quieres crear el test',
                                  SpreadsheetApp.getUi().ButtonSet.OK);
        if (response_id.getSelectedButton()== ui.Button.CANCEL)
          throw 'El usuario ha cancelado la acción.'
        var id=parseInt(response_id.getResponseText().trim());
        if (isNaN(id) || id<1)
          throw 'El valor de id de grupo introducido '+id+' debe ser un numero mayor de 0.'
    
    //si no existe entre los existentes lo creamos
        if (Object.keys(form).indexOf((new Number(id)).toString())<0)
            generarTestConvocatoria((new Number(id)).toString());
        else
          ui.alert('El formulario con id "'+id+'" ya existe.\n',SpreadsheetApp.getUi().ButtonSet.OK);
  }
  catch (error)
  {
    SpreadsheetApp.getUi().alert(error);
    logging.newEventTexts('ERROR durante la ejecución',error);
  }
}




/****************************************************************************************************
 * Lanzar el workflow para mandar la convocatoria al check-in
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function comenzarWorkflowConvocatoriaUI()
{
    var logging= new Logging('MANUAL(Enviar Mail Convocatoria)');
    try
    {        
          var is_seleccionados = isSoloSelececcionadosDialog();
          var fecha_rescatada;
     //obtiene la fecha de limite contestar TEST INICIAL si ya esta especificada
           try {fecha_rescatada=(new ThisSheet()).getFechaLimiteTest();}catch (error){fecha_rescatada=null;};
          comenzarWorkflowConvocatoria(
                  getValidDateDialogAfterToday(
                        'Eleccion de fecha Límite para contestar el test', 
                        fecha_rescatada)
                  ,is_seleccionados);
    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);

    }
}


/****************************************************************************************************
 * Lee las respuestas a los formularios de TEST INICIAL creados 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function recopilarRespuestasUI()
{
        var logging= new Logging('MANUAL(Leer respuestas Test Convocatoria)');
    try
    {        recopilarRespuestas();    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Para un formulario asociado a un grupo, si no existe lo genera y las hojas de correccion asociadas 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function mandarRecordatorioConFechaLimiteUI()
{
        var logging= new Logging('MANUAL(Enviar Recodatorio Test Convocatoria)');
    try
    {
        var is_seleccionados = isSoloSelececcionadosDialog();
        var fecha_rescatada;
     //obtiene la fecha de limite contestar TEST INICIAL si ya esta especificada
         try {fecha_rescatada=(new ThisSheet()).getFechaLimiteTest();}catch (error){fecha_rescatada=null;};             
                 
         mandarRecordatorioConFechaLimite(
                  getValidDateDialogAfterToday(
                        'Eleccion de fecha Límite para contestar el test', 
                        fecha_rescatada)
                  ,is_seleccionados);
    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Acciona el envío de los resultados del TEST INICIAL
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function mandarResultadosUI()
{
    var logging= new Logging('MANUAL(Enviar Resultados Test Convocatoria)');
    try
    {
      var is_seleccionados = isSoloSelececcionadosDialog();                 
      var fecha_rescatada;
     //obtiene la fecha de lanzamiento de revalida si ya esta especificada
       try {fecha_rescatada=(new ThisSheet()).getFechaLanzamientoRevalida();}catch (error){fecha_rescatada=null;};

     mandarResultados(
                  getValidDateDialogAfterToday(
                        'Eleccion de fecha Límite para realizar los MOOCs/lanzar la reválida', 
                        fecha_rescatada)
                  ,is_seleccionados);
    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Generar los triggers de envios de mensajes automaticos según la planificación indicada en la hoja
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function aplicarPlanificacionUI()
{
    var logging= new Logging('MANUAL(Aplicar Planificacion)');
    try    {        aplicarPlanificacion();    }
    catch (error)
    {
        //eliminamos los posibles trigger que se hayan creado
        stop_trigger_resultado_revalida();
        stop_trigger_recordatorio_limite_revalida();
        stop_trigger_lanzamiento_revalida();
        stop_trigger_resultados();
        stop_trigger_recodatorio_limite();
        stop_trigger_recordatorio_intermedio();
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Generar el test de REVALIDA especifico para un grupo y una materia, que serán preguntadas al usuario 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function generarTestRevalidaUI()
{
    var ui = SpreadsheetApp.getUi();        
    var logging= new Logging('MANUAL(Generar Tests Revalida)');
    try
    {
      //obtener todos los test de REVALIDA creados
          var versiones=(new ThisSheet()).getFormulariosRevalida();
          //Logger.log(JSON.stringify(Object.keys(versiones)));          
      
      //preguntamos por el grupo al que se le va a crear el formulario
          var  response_id = ui.prompt('Creando test de REVALIDA para el grupo...','Especifica para que grupo (id test) quieres crear el test',ui.ButtonSet.OK_CANCEL);
          if (response_id.getSelectedButton()== ui.Button.CANCEL)
            throw 'El usuario ha cancelado la acción.'
          var id=parseInt(response_id.getResponseText().trim());
          if (isNaN(id) || id<1)
            throw 'El valor de id de grupo introducido '+id+' debe ser un numero mayor de 0.'   

      //preguntamos por la materia que se le va a crear el formulario
          var  response_capability = ui.prompt('Creando test de REVALIDA para el grupo...','Especifica para que capability quieres crear el test',ui.ButtonSet.OK_CANCEL);
          if (response_capability.getSelectedButton()== ui.Button.CANCEL)
            throw 'El usuario ha cancelado la acción.'
          var capability=(new CapabilityList()).getValor(response_capability.getResponseText().trim());
      
      //si no existe para los valores indicados por el usuario, se crea el formulario
      if (Object.keys(versiones).indexOf((new Number(id)).toString())<0 || versiones[(new Number(id)).toString()][capability.getId()])
        generarTestRevalida((new Number(id).toString()),capability.getId());
      else
        SpreadsheetApp.getUi().alert('El formulario con id "'+id+'" y para la capability "'+capability.getId()+'" ya existe.\n',ui.ButtonSet.OK);
    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error)
    }
}



/****************************************************************************************************
 * Lanza la REVALIDA para aquellos que deban realizarlo 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function lanzarRevalidaUI()
{
    var logging= new Logging('MANUAL(Enviar Revalida)');
    try
    {
      var ui=SpreadsheetApp.getUi();
       var is_seleccionados = isSoloSelececcionadosDialog();

      var fecha_rescatada;
     //obtiene la fecha de limite revalida si ya esta especificada
       try {fecha_rescatada=(new ThisSheet()).getFechaLimiteRevalida();}catch (error){fecha_rescatada=null;};                       
        lanzarRevalida(
                  getValidDateDialogAfterToday(
                        'Eleccion de fecha Límite para realizar realizar la reválida', 
                        fecha_rescatada)
                  ,is_seleccionados);
    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Lanza un recordatorio para aquellos que deban hacer la revalida y no lo hayan completado 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function mandarRecordatorioRevalidaUI()
{
    var logging= new Logging('MANUAL(Enviar Recodatorio Revalida)');
    try
    {      
     var is_seleccionados = isSoloSelececcionadosDialog();
     var fecha_rescatada;
     //obtiene la fecha de limite revalida si ya esta especificada
         try {fecha_rescatada=(new ThisSheet()).getFechaLimiteRevalida();}catch (error){fecha_rescatada=null;};
     //mandar recordatorio
        mandarRecordatorioConFechaLimiteRevalida(
                  getValidDateDialogAfterToday(
                        'Eleccion de fecha Límite para realizar realizar la reválida', 
                        fecha_rescatada)
                  ,is_seleccionados);
    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);

    }
}


/****************************************************************************************************
 * Lee las respuestas a los formularios de REVALIDA creados 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function leerRespuestasRevalidaUI()
{
    var logging= new Logging('MANUAL(Leer Respuestas Revalida)');
    try     {  recopilarRespuestasRevalida();    }
    catch (error)
    {
        SpreadsheetApp.getUi().alert(error);
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Para un formulario asociado a un grupo, si no existe lo genera y las hojas de correccion asociadas 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/
function generarExcelResultados() {
  //iniciación de todos los valores asociados al curso
      var this_sheet=new ThisSheet();
  
  var result_ss_fichero = DriveApp.getFileById(this_sheet.getPrograma().getIdArchivoResultados())
  .makeCopy('RESULTS '+this_sheet._getPrefijoArchivos(),
      this_sheet._getDirectorioResultados()); 
  
  //copiar valores de Pais y Programa
  var ss=SpreadsheetApp.openById(result_ss_fichero.getId());
  ss.getSheetByName('Referencias').getRange('PROGRAMA').setValue(this_sheet.getPrograma().getNombre());
  ss.getSheetByName('Referencias').getRange('Q').setValue(this_sheet.getQ());
  ss.getSheetByName('Referencias').getRange('PAIS').setValue(this_sheet.getPais().getNombre());
  
  SpreadsheetApp.openById(result_ss_fichero.getId()).getSheetByName('REPORT').getRange(1,1).setFormula('=IMPORTRANGE("'+SpreadsheetApp.getActive().getId()+'","REPORT!A:AP")');
  
  var logging=new Logging();
  logging.newEventTextFormula('Generado excel de resultados','=HYPERLINK("'+result_ss_fichero.getUrl()+'";"'+result_ss_fichero.getName()+'")');
}



/****************************************************************************************************
 * PRUEBAS 
 *****************************************************************************************************/
function pruebaAlert(){
  Logger.log('seleccionado::'+isSoloSelececcionadosDialog());
  Logger.log('fecha con null por defecto:'+getValidDateDialogAfterToday('Quieres poner una fecha lokjo?',null));
  var date = new Date();
  date.setDate(date.getDate()+1);
  Logger.log('fecha con mañana por defecto:'+getValidDateDialogAfterToday('Quieres poner una fecha lokjo?',date));
}
