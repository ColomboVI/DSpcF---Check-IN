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
 + generarTestRevalida: * Generar el test de REVALIDA para determinado grupo con un id y para determinada capability
 + lanzarRevalida:   * Lanzar los test de REVALIDA a los participantes que se haya establecido que lo reciban indicando la fecha limite para contestar
 + recopilarRespuestasRevalida:  * recopilar las respuestas de los formularios existentes en la carpeta REVALIDA y trasladarlas a las hojas de corrección del excel 
 + mandarRecordatorioConFechaLimiteRevalida:  * Accion para lanzar un recordatorio a los inscritos que no hayan completado el test REVALIDA advirtiéndoles de la fecha límite
 + recordarCuestionarioRevalida: * Funcionalidad que aglutina recopilar respuestas y el envio del recordatoio de la REVALIDA segun la fecha planificada
 + lanzarCuestionarioRevalida: * Funcionalidad para lanzar la REVALIDA indicando la fecha limite especificada
***/
  
  
  
  
  
/****************************************************************************************************
 * Generar el test de REVALIDA para determinado grupo con un id y para determinada capability
 
 * @param {String} id   id del grupo que debera responder este test inicial
 * @param {String} capability   materia/capability/debilidad para el cual se ha configurado un test de revalida
 * @returns {Objeto:FormApp.Form}
 * @exception NINGUNO
 
 *****************************************************************************************************/ 
function generarTestRevalida(id, capability) { 
  
  var test=new RevalidaTest(capability);
   try
  {
     
  var formulario_drive= DriveApp.getFileById(test.getFormulario().getId());
  var excel_drive= DriveApp.getFileById(test.getExcelAsociado().getId());

  formulario_drive.setName('Check-in '+id+' REV '+capability);
  
  (new ThisSheet()).addTestRevalida(test);
  
  DriveApp.getRootFolder().removeFile(formulario_drive);  
  DriveApp.getRootFolder().removeFile(excel_drive);
  
    
    
    
    //crear plantilla de correccion en el excel de seguimiento
    //obtenemos todas las plantillas que haya obteniendo el numero id de grupo al que estan asociadas
          var array_idformularios_distintos=SpreadsheetApp.getActive().getSheets()
              .filter(function(sheet){return /^Check-in\(REVALIDA\)\(TEST\d+\)$/.test(sheet.getName());});
          //Logger.log(JSON.stringify(array_idformularios_distintos));
          if (array_idformularios_distintos.length>0)
            array_idformularios_distintos=array_idformularios_distintos.map(function(sheet){ return /^Check-in\(REVALIDA\)\(TEST(\d+)\)$/.exec(sheet.getName())[1];});
          //Logger.log(JSON.stringify(array_idformularios_distintos));
    
    //buscamos si existe    
        if (array_idformularios_distintos.indexOf(id)<0)
        {
      //insertamos el nuevo valor
          array_idformularios_distintos.push(id);
          
      //creamos la nueva hoja segun la plantilla, le cambiamos el nombre y el color de la pestaña y la ocultamos
          SpreadsheetApp.getActive().getSheetByName('Check-in(TESTPLANTILLA)').copyTo(SpreadsheetApp.getActive())
          .setName('Check-in(REVALIDA)(TEST'+id+')')
          .hideSheet()
          .setTabColor('#00ffff');
      
      //actualizar formula de hoja 
      //hay que actualizar la formula de hoja Check-in(REVALIDA) para que coja los valores de la nueva hoja de correcion
      //obtenemos la formula actual
          var formula_actual=SpreadsheetApp.getActive().getRange('VOLCADO_REVALIDA').getFormula();
          
      //obtenemos la parte de la formula que se refiere a obtener los valores de las hojas  de correccion
      // EJEMPLO:
      //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""});
      //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""});
      //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""})
          var formula_reemplazar=/\{\n([\s\S]+)\n\}/.exec(formula_actual)[1];
          //Logger.log(JSON.stringify(formula_reemplazar));
          
      //obtenemos la formula base que jugaremos a parametrizar segun el id para que se obtengan los valores de una hoja de correcion
      // EJEMPLO:
      //           IFERROR(query('Check-in(TESTPLANTILLA)'!A4:BA;"Select .....\""\""\""\""\""\""\""})
          var formula_base=/^(.+[^;])$/m.exec(formula_reemplazar)[1];
          //Logger.log(JSON.stringify(formula_base));      
      
      //establecemos la nueva formula cambiando los parametros en la formula_base por cada grupo(hoja de correccion) existente
          SpreadsheetApp.getActive().getRange('VOLCADO_REVALIDA').setFormula(
            formula_actual.replace(formula_reemplazar,
                                   array_idformularios_distintos.map(function(item){return this.replace(/(\(TESTPLANTILLA\)|\(REVALIDA\)\(TEST\d+\))/g,'(REVALIDA)(TEST'+item+')')},formula_base).join(';\n'))
              );
    }
    
    var logging=new Logging();
    logging.newEventTextFormula('Generar Tests Revalida','=HYPERLINK("'+formulario_drive.getUrl()+'";"'+formulario_drive.getName()+'")');
    
    //devolvemos solo el formulario
    return test.getFormulario();
  }
  catch(error)
  {
    // deshacer creacion de hojas de correcion de test
    //no la podemos eliminar a este nivel porque no sabemos si hay mas formularios que apunten tengan esa hoja para descargar resultados    
    
    // deshacer creacion de formulario    
        var formulario_drive= DriveApp.getFileById(test.getFormulario().getId());
        var folders = formulario_drive.getParents(),folder;
        while (folders.hasNext())
          folders.next().removeFile(formulario_drive);
    
    // deshacer creacion de formulario
        var excel_drive= DriveApp.getFileById(test.getExcelAsociado().getId());
        var folders = excel_drive.getParents(),folder;
        while (folders.hasNext())
          folders.next().removeFile(excel_drive);
          
    //propagamos el error
    throw error;
  }
}

/****************************************************************************************************
 * Lanzar los test de REVALIDA a los participantes que se haya establecido que lo reciban indicando la fecha limite para contestar
 
 * @param {Date} fecha_limite_revalida   Fecha limite para contestar la reválida
 * @param {boolean} is_solo_seleccionados   Filtro de los destinatarios del recordatorio
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/ 
function lanzarRevalida(fecha_limite_revalida,is_solo_seleccionados)
{
  var comunicaciones=new Comunicaciones();
  var participantes = new ReportParticipantes();
  
  var versiones=(new ThisSheet()).getFormulariosRevalida();
  var emails_enviados=0;
  
  //Logger.log(JSON.stringify(versiones));
  
  for (var i=0;i<participantes.getNumElementos();i++)
  {
    if (!participantes.getElemento(i).isStatusBaja()
        && (!is_solo_seleccionados || (is_solo_seleccionados && participantes.getElemento(i).isStatusSeleccionado())))
    {
      
      if(/^NO APTO/.test(participantes.getElemento(i).getLeyenda())&&participantes.getElemento(i).isNeededRevalida())
      {
        Logger.log('iniciarRevalida] ES UN NO APT range_resultados[i][leyenda_position] =>'
                   +participantes.getElemento(i).getLeyenda()+' necesita revalida=> '+participantes.getElemento(i).isNeededRevalida())
        
        var tests_revalida=[], debilidades=participantes.getElemento(i).getPlanDeChoque();
        var form_created=null;
        for (var j=0;j<debilidades.length;j++)
        {
          tests_revalida.push({
            capability:debilidades[j].getNombre(),
            formulario:((versiones[participantes.getElemento(i).getTestId()] && versiones[participantes.getElemento(i).getTestId()][debilidades[j].getId()])?
            FormApp.openById(versiones[participantes.getElemento(i).getTestId()][debilidades[j].getId()].getId())
            :(form_created=generarTestRevalida(participantes.getElemento(i).getTestId(), debilidades[j].getId())))
          });
          
          if (form_created)
          {
            if (!versiones[participantes.getElemento(i).getTestId()])
              versiones[participantes.getElemento(i).getTestId()]={};
            versiones[participantes.getElemento(i).getTestId()][debilidades[j].getId()]=form_created;
            form_created=null;
          }
        }
        comunicaciones.mandarRevalida(participantes.getElemento(i),fecha_limite_revalida, tests_revalida);
        emails_enviados++;
      }
    }
  }
  
  var logging=new Logging();
  logging.newEventTexts('Correcto','Se ha mandado la revalida a '+((is_solo_seleccionados)?'solo los seleccionados':'todos los inscritos')+
    ' ('+
      emails_enviados+
        ')   con limite para completarla el '+fecha_limite_revalida.toLocaleString());
}


/****************************************************************************************************
 * recopilar las respuestas de los formularios existentes en la carpeta REVALIDA y trasladarlas a las hojas de corrección del excel 
 
 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/ 

function recopilarRespuestasRevalida() {

    var versiones=(new ThisSheet()).getRespuestasRevalida();
    
    for (var test_id in versiones)
    {
      for (var capability in versiones[test_id])
      {           
        
        var test_sheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Check-in(REVALIDA)(TEST'+test_id+')');
        if (!test_sheet)
          throw 'No se ha la hoja correspondiente para volvar los resultados de :'+versiones[test_id][capability].getName();
        var test_file=SpreadsheetApp.open(versiones[test_id][capability]).getActiveSheet();
        var array_capabilities_preguntas=test_sheet.getRange(1,1,1,test_sheet.getLastColumn()).getValues()[0];
        var indice_capability=array_capabilities_preguntas.indexOf(capability);
        if (indice_capability<0)
          throw 'No se ha encontrado la capability "'+capability+'", la hoja no esta correctamente formada o el test no corresponde al programa.'
          var columna_capability=indice_capability+1;
        var n_respuestas=test_sheet.getLastRow()-2;
        var preguntas_capability=array_capabilities_preguntas.reduce(function (capability){return function(total,item){return total+=(item==capability);}}(capability),0);
        //escribimos la respuesta (fila2 de test_file) en la fila 2
        test_sheet.getRange(2, columna_capability,1,preguntas_capability).setValues(test_file.getRange(2, 3,1,preguntas_capability).getValues());
        //escribimos el enunciado (fila1 de test_file) en la fila 3
        test_sheet.getRange(3, columna_capability,1,preguntas_capability).setValues(test_file.getRange(1, 3,1,preguntas_capability).getValues());
        //escribrimos las respuestas de los alumnos(fila3 y siguientes de test_file) en las siguientes filas
        var emails_respuestas=test_sheet.getRange(4, 2,test_sheet.getLastRow(),1).getValues().map(function(item){return item[0];}).filter(function(item){return !/^$/.test(item);});
        for (var i=1;i<=n_respuestas;i++)
        {
          var respuesta_i=test_file.getRange(2+i, 2,1,preguntas_capability+1).getValues()[0];
          var exite=emails_respuestas.indexOf(respuesta_i[0]);
          
          if (exite>-1)
          {
            respuesta_i.shift();
            test_sheet.getRange(4+exite, columna_capability,1,preguntas_capability).setValues([respuesta_i]);
          }
          else
          {
            emails_respuestas.push(respuesta_i[0]);
            test_sheet.getRange(3+emails_respuestas.length, 2).setValue(respuesta_i.shift());
            test_sheet.getRange(3+emails_respuestas.length, columna_capability,1,preguntas_capability).setValues([respuesta_i]);
          }
        }
      }
    }
    
    var logging=new Logging();
    logging.newEventTexts('Correcto','Se han leido las respuestas de la revalida');

}
/****************************************************************************************************
 * Accion para lanzar un recordatorio a los inscritos que no hayan completado el test REVALIDA advirtiéndoles de la fecha límite
 
 * @param {Date} fecha_limite_revalida   Fecha limite para contestar la reválida
 * @param {boolean} is_solo_seleccionados   Filtro de los destinatarios del recordatorio
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/ 

function mandarRecordatorioConFechaLimiteRevalida(fecha_limite_revalida,is_solo_seleccionados)
{
    var comunicaciones=new Comunicaciones();
    var participantes = new ReportParticipantes();
    var versiones=(new ThisSheet()).getFormulariosRevalida();
    var emails_enviados=0;
    for (var i=0;i<participantes.getNumElementos();i++)
    {
      if (!participantes.getElemento(i).isStatusBaja()
          && (!is_solo_seleccionados || (is_solo_seleccionados && participantes.getElemento(i).isStatusSeleccionado())))
      {
        
        if(/^NO APTO/.test(participantes.getElemento(i).getLeyenda())&&participantes.getElemento(i).isNeededRevalida()
          &&!participantes.getElemento(i).isDoneRevalida())
          {
            Logger.log('iniciarRevalida] ES UN NO APT range_resultados[i][leyenda_position] =>'
                       +participantes.getElemento(i).getLeyenda()+' necesita revalida=> '+participantes.getElemento(i).isNeededRevalida())
            
            var tests_revalida=[], debilidades=participantes.getElemento(i).getPlanDeChoque();
            var form_created=null;
            for (var j=0;j<debilidades.length;j++)
            {
              tests_revalida.push({
                capability:debilidades[j].getNombre(),
                formulario:((versiones[participantes.getElemento(i).getTestId()] && versiones[participantes.getElemento(i).getTestId()][debilidades[j].getId()])?
                FormApp.openById(versiones[participantes.getElemento(i).getTestId()][debilidades[j].getId()].getId())
                :(form_created=generarTestRevalida(participantes.getElemento(i).getTestId(), debilidades[j].getId())))
              });
              
              if (form_created)
              {
                if (!versiones[participantes.getElemento(i).getTestId()])
                  versiones[participantes.getElemento(i).getTestId()]={};
                versiones[participantes.getElemento(i).getTestId()][debilidades[j].getId()]=form_created;
                form_created=null;
              }
            }
            comunicaciones.enviarRecordatorioRevalida(participantes.getElemento(i),fecha_limite_revalida, tests_revalida);
            emails_enviados++;
          }
      }
    }
    
    var logging=new Logging();
    logging.newEventTexts('Correcto','Se ha mandado el recordatorio de revalida a '+((is_solo_seleccionados)?'solo los seleccionados':'todos los inscritos')+
      ' ('+
        emails_enviados+
          ')  con limite para completarla el '+fecha_limite_revalida.toLocaleString());
}


/****************************************************************************************************
 * Funcionalidad que aglutina recopilar respuestas y el envio del recordatoio de la REVALIDA segun la fecha planificada

 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/ 

function recordarCuestionarioRevalida()
{
    var logging= new Logging('AUTOMATICO(Enviar Recodatorio Revalida)');
    try
    {
  recopilarRespuestasRevalida();
  mandarRecordatorioConFechaLimiteRevalida((new ThisSheet()).getFechaLimiteRevalida());
    }
    catch (error)
    {
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}
/****************************************************************************************************
 * Funcionalidad para lanzar la REVALIDA indicando la fecha limite especificada

 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/ 

function lanzarCuestionarioRevalida()
{
    var logging= new Logging('AUTOMATICO(Enviar Revalida)');
    try
    {
  lanzarRevalida((new ThisSheet()).getFechaLimiteRevalida());
    }
    catch (error)
    {
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}
/****************************************************************************************************
 * Funcionalidad para recoger las respuestas de la REVALIDA de forma automatica

 * @param NINGUNO
 * @returns NINGUNO
 * @exception NINGUNO
 
 *****************************************************************************************************/ 

function recopilarRespuestasRevalidaTrigger()
{
    var logging= new Logging('AUTOMATICO(Leer respuestas Revalida)');
    try
    {
  recopilarRespuestasRevalida();
    }
    catch (error)
    {
        logging.newEventTexts('ERROR durante la ejecución',error);
    }
}