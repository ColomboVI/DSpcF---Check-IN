/**************************************************************************\
 * Copyright (C) 2018 by Synergic Partners                                 *
 *                                                                         *
 * author     : Borja Durán                                                *
 * description:                                                            *
 * - funciones que permiten gestionar los test iniciales del check-in      *
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
 + generarTestConvocatoria: * Generar el test inicial para determinado grupo con un id
 + recopilarRespuestas: * recopilar las respuestas de los formularios existentes en la carpeta TEST INICIAL y trasladarlas a las hojas de corrección del excel 
 + mandarRecordatorioConFechaLimite: * Accion para lanzar un recordatorio a los inscritos que no hayan completado el test inicial advirtiéndoles de la fecha límite
 + mandarResultados: * Accion para lanzar los resultados del cuestionario a los inscritos que hayan completado el test advirtiéndoles de la fecha límite de revalida en caso necesario
 + recordarCuestionario:* Funcionalidad que aglutina recopilar respuestas y el envio del recordatoio segun la fecha planificada
 + mandarResultadosCuestionario:  * Funcionalidad que aglutina recopilar respuestas y el envio de resultados post fecha limite de contestación 
***/
  
  
  
  
  
/****************************************************************************************************
 * Generar el test inicial para determinado grupo con un id
 
 * @param {String} id   id del grupo que debera responder este test inicial
 * @returns {Objeto:FormApp.Form}
 * @exception NINGUNO
 
 *****************************************************************************************************/
function generarTestConvocatoria(id) {
   
    //solicitamos crear un formulario de check in
         var formulario=new CheckinTest();
    try
    {
      //le especificamos el nombre y lo movemos al directorio correspondiente
      var formulario_drive= DriveApp.getFileById(formulario.getFormulario().getId());
      var excel_drive= DriveApp.getFileById(formulario.getExcelAsociado().getId());
      
      formulario_drive.setName('Check-in '+id);
      
      (new ThisSheet()).addTestInicial(formulario);
      
      DriveApp.getRootFolder().removeFile(formulario_drive);
      DriveApp.getRootFolder().removeFile(excel_drive);
      
      //crear plantilla de correccion en el excel de seguimiento
      //obtenemos todas las plantillas que haya obteniendo el numero id de grupo al que estan asociadas
          var array_idformularios_distintos=SpreadsheetApp.getActive().getSheets()
                .filter(function(sheet){return /^Check-in\(TEST\d+\)$/.test(sheet.getName());});
          if (array_idformularios_distintos.length>0)
            array_idformularios_distintos=array_idformularios_distintos.map(function(sheet){ return /^Check-in\(TEST(\d+)\)$/.exec(sheet.getName())[1];});
          //Logger.log(JSON.stringify(array_idformularios_distintos))
      
      //buscamos si existe
      if (array_idformularios_distintos.indexOf(id)<0)
      {
        //insertamos el nuevo valor
                array_idformularios_distintos.push(id);
                
        //creamos la nueva hoja segun la plantilla, le cambiamos el nombre y el color de la pestaña y la ocultamos
                SpreadsheetApp.getActive().getSheetByName('Check-in(TESTPLANTILLA)').copyTo(SpreadsheetApp.getActive())
                    .setName('Check-in(TEST'+id+')')
                    .hideSheet()
                    .setTabColor('#1155cc');
                    
        //hay que actualizar la formula de hoja Check-in para que coja los valores de la nueva hoja de correcion
        //obtenemos la formula actual
                  var formula_actual=SpreadsheetApp.getActive().getRange('VOLCADO_CHECKIN').getFormula();
                  //Logger.log(JSON.stringify(formula_actual))
                  //Logger.log(/\{\n([\s\S]+)\n\}/.test(formula_actual))
                  
        //obtenemos la parte de la formula que se refiere a obtener los valores de las hojas  de correccion
        // EJEMPLO:
        //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""});
        //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""});
        //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""})
                  var formula_reemplazar=/\{\n([\s\S]+)\n\}/.exec(formula_actual)[1];
                  //Logger.log(JSON.stringify(formula_reemplazar));
                  //Logger.log(/^(.+[^;])$/m.exec(formula_base));
                  
        //obtenemos la formula base que jugaremos a parametrizar segun el id para que se obtengan los valores de una hoja de correcion
        // EJEMPLO:
        //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""})
              var formula_base=/^(.+[^;])$/m.exec(formula_reemplazar)[1];
              //Logger.log(JSON.stringify(formula_base));
        
        //establecemos la nueva formula cambiando los parametros en la formula_base por cada grupo(hoja de correccion) existente
            SpreadsheetApp.getActive().getRange('VOLCADO_CHECKIN').setFormula(
                  formula_actual.replace(formula_reemplazar,
                                     array_idformularios_distintos.map(
                                     function(id){return this.replace(/TEST(PLANTILLA|(\d+))/g,'TEST'+id)},formula_base).join(';\n'))
                  );
      }
      
      var logging=new Logging();
      logging.newEventTextFormula('Generado Tests Convocatoria id:'+id,'=HYPERLINK("'+formulario_drive.getUrl()+'";"'+formulario_drive.getName()+'")');

      //devolvemos solo el formulario
            return formulario.getFormulario();
      
    }
   catch(error)
   {
       // deshacer creacion de hojas de correcion de test
             if (    SpreadsheetApp.getActive().getSheetByName('Check-in(TEST'+id+')'))
                 SpreadsheetApp.getActive().deleteSheet(SpreadsheetApp.getActive().getSheetByName('Check-in(TEST'+id+')'));
       // deshacer creacion de formulario
             var formulario_drive= DriveApp.getFileById(formulario.getFormulario().getId());
             var folders = formulario_drive.getParents(),folder;
               while (folders.hasNext())
                 folders.next().removeFile(formulario_drive);
       // deshacer creacion de formulario
             var excel_drive= DriveApp.getFileById(formulario.getExcelAsociado().getId());
             var folders = excel_drive.getParents(),folder;
             while (folders.hasNext())
               folders.next().removeFile(excel_drive);
     //propagamos el error
             throw error;
   }
}    



/****************************************************************************************************
 * recopilar las respuestas de los formularios existentes en la carpeta TEST INICIAL y trasladarlas a las hojas de corrección del excel 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/

function recopilarRespuestas() {
      //recopilamos los exceles de respuestas de los formularios
      var form =(new ThisSheet()).getRespuestasTestInicial();
       for (var id in form)
       {
           var excel_response = SpreadsheetApp.open(form[id]);
           var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Check-in(TEST'+id+')');
           if (!sheet)
             throw 'No existe hoja para recoger los resultados del formulario: Check-in '+id;
             
           var last_column_excel_response = excel_response.getLastColumn();
           if (excel_response.getLastRow()-1>0)
           {
             //Logger.log('recopilarRespuestas] getValues() para'+sheet.getRange(1, 1, excel_response.getLastRow(), excel_response.getLastColumn()).getA1Notation());
             //Logger.log('recopilarRespuestas] setValues() para'+sheet.getRange(3, 1, excel_response.getLastRow(), excel_response.getLastColumn()).getA1Notation());
             //ubicamos las respuestas a partir de la fila 3
             sheet.getRange(3, 1, excel_response.getLastRow(), excel_response.getLastColumn()).setValues(excel_response.getActiveSheet().getRange(1, 1, excel_response.getLastRow(), excel_response.getLastColumn()).getValues())
           }
           else
           {
             //Logger.log('recopilarRespuestas] no se recogeran las respuestas de sheet['+i+'].name='+sheet.getName()+' porque no hay respuestas');
           }
       }
/* VERSION ANTERIOR
         var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
          for (var i=0; i< sheets.length;i++)
          {
              Logger.log('sheet['+i+'].name='+sheets[i].getName()+' y se parece al nombre del formulario :'+ ((sheets[i].getFormUrl())?DriveApp.getFileById(FormApp.openByUrl(sheets[i].getFormUrl()).getId()).getName():'ninguno'))
              //solo realizamos esta operacion si la hoja corresponde a una de respuesta de formacuoios creados
              if (/^Check in\(TEST\d\)$/.test(sheets[i].getName()))
              {
                      Logger.log('recopilarRespuestas] sheet['+i+'].name='+sheets[i].getName());
                      
                      var excel_response_url,excel_response;
                      //cogermos el valor en la celda A1
                      //si no es vacio entocnes abrimos la hoja y copiamos los valores
                      if ((excel_response_url=sheets[i].getRange('A1').getValue()).length!=0)
                      {
                        excel_response= SpreadsheetApp.openByUrl(excel_response_url);
                        
                        var last_column_excel_response = excel_response.getLastColumn();
                        if (excel_response.getLastRow()-1>0)
                        {
                            Logger.log('recopilarRespuestas] getValues() para'+sheets[i].getRange(1, 1, excel_response.getLastRow(), excel_response.getLastColumn()).getA1Notation());
                            Logger.log('recopilarRespuestas] setValues() para'+sheets[i].getRange(3, 1, excel_response.getLastRow(), excel_response.getLastColumn()).getA1Notation());
                            sheets[i].getRange(3, 1, excel_response.getLastRow(), excel_response.getLastColumn()).setValues(excel_response.getActiveSheet().getRange(1, 1, excel_response.getLastRow(), excel_response.getLastColumn()).getValues())
                        }
                        else
                            Logger.log('recopilarRespuestas] no se recogeran las respuestas de sheet['+i+'].name='+sheets[i].getName()+' porque no hay respuestas');
                      }
              }   
       }*/
        var logging= new Logging();
        logging.newEventTexts('Correcto','Se han leido las respuestas de los test de convocatoria.');
}


/****************************************************************************************************
 * Accion para lanzar un recordatorio a los inscritos que no hayan completado el test inicial advirtiéndoles de la fecha límite
 
 * @param {Date} deadline   Fecha limite para responder al cuestionario que se comunicará al interesado
 * @param {boolean} is_solo_seleccionados   Filtro de los destinatarios del recordatorio
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/

function mandarRecordatorioConFechaLimite(deadline,is_solo_seleccionados)
{    
      var this_sheet=new ThisSheet();
      var comunicaciones=new Comunicaciones();
       
      var inscritos = new Inscritos(), to=[];
      //filtramos en to aquellos destinatarios validos: no esten dados de baja, no hayan hecho el examen y sean seleccionados cuando este is_solo_seleccionados=true
      for (var i=0;i<inscritos.getNumElementos();i++)
      {
        if (!inscritos.getElemento(i).isStatusBaja() && !inscritos.getElemento(i).isRealizadoTestConvocatoria() 
                  && (!is_solo_seleccionados || (is_solo_seleccionados && inscritos.getElemento(i).isStatusSeleccionado())))
          to.push(inscritos.getElemento(i));        
      }
            
      //obtenemos los formulario de TEST INICIAL existentes
      var form =this_sheet.getFormulariosTestInicial();
      
      //generamos los grupos existentes en función de los test id asignados a los inscritos filtrados
      var grupos={};
      for (var i=0;i<to.length;i++)
      {
          grupos[parseInt(to[i].getTestId())]=([to[i]]).concat(grupos[parseInt(to[i].getTestId())]||[]);
      }
      
      //Logger.log('mandarMailConvocatoria] grupos '+JSON.stringify(grupos));
      //Logger.log("mandarMailConvocatoria] grupos.length="+JSON.stringify(Object.keys(grupos)))
           
      //comprobacion que cada grupo tiene su formulario y si no se crea
      Object.keys(grupos)
         .filter(function (item){return this.indexOf(item)<0;},Object.keys(form))
         .forEach(function(item){this[item]=generarTestConvocatoria(item);},form);
      
      //Logger.log('mandarMailConvocatoria] form '+JSON.stringify(form));
      //Logger.log('mandarMailConvocatoria] form '+JSON.stringify(grupos));

      //se procede a hacer el envio por cada grupo
      for (var grupo in grupos)
      {
          //if (grupos[grupo] && grupos[grupo].length>0)
               comunicaciones.enviarRecordatorioTestInicial(grupos[grupo],this_sheet.getDetalleCurso(),FormApp.openById(form[grupo].getId()),deadline);
      }
            
      var logging= new Logging();
      logging.newEventTexts('Correcto','Se ha mandado el recordatorio a '+((is_solo_seleccionados)?'solo los seleccionados':'todos los inscritos')+
        ' ('+
          to.length+
            ') con limite para responder el '+deadline.toLocaleString());

}



/****************************************************************************************************
* Accion para lanzar los resultados del cuestionario a los inscritos que hayan completado el test advirtiéndoles de la fecha límite de revalida en caso necesario
 
 * @param {Date} fecha_revalida   Fecha en la cual recibirán la reválida el interesado que deba hacerla
 * @param {boolean} is_solo_seleccionados   Filtro de los destinatarios del recordatorio
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/

function mandarResultados(fecha_revalida,is_solo_seleccionados)
{
      var this_sheet=new ThisSheet();
      var comunicaciones=new Comunicaciones();
      var participantes = new ReportParticipantes();
      var ss_checkin=SpreadsheetApp.getActive().getSheetByName('Check-in');
      var tabla_checkin=new Tabla(ss_checkin,1, 1, ss_checkin.getLastRow(), ss_checkin.getLastColumn(),3);
      var emails_enviados=0;
      for (var i=0;i<participantes.getNumElementos();i++)
      {
        if (!participantes.getElemento(i).isStatusBaja()
                  && (!is_solo_seleccionados || (is_solo_seleccionados && participantes.getElemento(i).isStatusSeleccionado())))
        {
             //condicionar el mensaje en funcion de su apribea o no
             if(/^APTO$/.test(participantes.getElemento(i).getLeyenda()))
             {
                 //Logger.log('mandarResultados] ES UN APT range_resultados[i][leyenda_position] =>'+participantes.getElemento(i).getLeyenda())
                 comunicaciones.mandarResultadoApto(participantes.getElemento(i));
                 emails_enviados++;
             }
             else if (/^NO APTO/.test(participantes.getElemento(i).getLeyenda()))
             {
                 //Logger.log('mandarResultados] ES UN NO APT range_resultados[i][leyenda_position] =>'+participantes.getElemento(i).getLeyenda()) 
                 //buscamos el registro del particpante en la pestaña Check-in que coincida con el mismo Test id, puede haber hecho el mismo participante varios test
                 //diferentes en el caso de que se le haya dado dos oportunidades diferentes
                 var k=tabla_checkin.getNumFilaColumnaIndexValue(participantes.getElemento(i).getEmailBBVA()),encontrado=false;
                 while(!encontrado )
                 {
                   encontrado=tabla_checkin.getElementoFilaColumna(k, 'Test ID')==participantes.getElemento(i).getTestId();
                   if (!encontrado)
                     k=tabla_checkin.getNumFilaColumnaIndexValue(participantes.getElemento(i).getEmailBBVA(),k+1);
                 }
                 
                 tabla_checkin.setElementoFilaColumnaValor(k,'REVALIDA','SI');
                 
                 comunicaciones.mandarResultadoNoApto(participantes.getElemento(i),fecha_revalida);
                 emails_enviados++;
             }
             else if (/^NO VALIDO/.test(participantes.getElemento(i).getLeyenda()))
             {
                // Logger.log('mandarResultados] ES UN NO VALIDO range_resultados[i][leyenda_position] =>'+participantes.getElemento(i).getLeyenda())
                  comunicaciones.mandarResultadoNoValido(participantes.getElemento(i));
                 emails_enviados++;
             }
         }
      } 
        var logging=new Logging();
              logging.newEventTexts('Correcto','Se ha mandado los resultados a '+((is_solo_seleccionados)?'solo los seleccionados':'todos los inscritos')+
                  ' ('+
                  emails_enviados+
                  ') con limite para realizar los MOOCs el '+fecha_revalida.toLocaleString());
}


/****************************************************************************************************
 * Funcionalidad que aglutina recopilar respuestas y el envio del recordatoio segun la fecha planificada
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/

function recordarCuestionario() {
    var logging= new Logging('AUTOMATICO(Enviar Recodatorio Test Convocatoria)');
    try
    {
            recopilarRespuestas();
            mandarRecordatorioConFechaLimite((new ThisSheet()).getFechaLimiteTest());
    }
    catch (error)
    {
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * Funcionalidad de mandar resultados post fecha limite de contestación 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/

function mandarResultadosCuestionario() {
    var logging= new Logging('AUTOMATICO(Enviar Resultados Test Convocatoria)');
    try
    {
            recopilarRespuestas();
            mandarResultados((new ThisSheet()).getFechaLanzamientoRevalida());
    }
    catch (error)
    {
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}


/****************************************************************************************************
 * PRUEBAS 
 *****************************************************************************************************/

function pruebaActualizarRevalida(){
      var tabla_checkin=new Tabla(SpreadsheetApp.getActive().getSheetByName('Check in'),1, 1, ss_paises.getLastRow(), ss_paises.getLastColumn(),2);
  tabla_checkin.setElementoFilaColumnaValor(tabla_checkin.getNumFilaColumnaIndexValue('bduran@synergicpartners.com'),'REVALIDA','SI');
               
}