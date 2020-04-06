/**************************************************************************\
 * Copyright (C) 2018 by Synergic Partners                                 *
 *                                                                         *
 * author     : Borja Durán                                                *
 * description:                                                            *
 * - funciones que acutalizan las fechas de ejecucion de eventos (triggers) y su cancelacion      *
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
    
    
function aplicarPlanificacion ()
{
     var logger= new Logging('MANUAL(aplicar Planificacion)');
     var prueba=false;
     var this_sheet = new ThisSheet();
     var document_properties = PropertiesService.getScriptProperties();

      
      //establecemos la fecha actual
              var today = new Date();
      
      
      //creamos fechas de ejecucion que con respecto a la actual 
              var date_recordatorio_intermedio = new Date(SpreadsheetApp.getActive().getRange('PROP_FECHA_RECORDATORIO_INTERMEDIO').getValue()),
                  date_recordatorio_limite_test = new Date(SpreadsheetApp.getActive().getRange('PROP_FECHA_LIMITE_TEST').getValue()),
                  date_resultados = new Date(SpreadsheetApp.getActive().getRange('PROP_FECHA_RESULTADOS').getValue()),
                  date_lanzamiento_revalida = new Date(SpreadsheetApp.getActive().getRange('PROP_FECHA_LANZAMIENTO_REVALIDA').getValue()),
                  date_recordatorio_limite_revalida = new Date(SpreadsheetApp.getActive().getRange('PROP_FECHA_LIMITE_REVALIDA').getValue());
                  
              if (isNaN(date_recordatorio_intermedio))
                throw 'La fecha indicada para lanzamiento de recordatorio intermedio no es válida.';
              if (isNaN(date_recordatorio_limite_test))
                throw 'La fecha indicada para dia límite de contestación test inicial (lanzamiento recordatorio) no es válida.';
              if (isNaN(date_resultados))
                throw 'La fecha indicada para comunicación de resultados no es válida.';
              if (isNaN(date_lanzamiento_revalida))
                throw 'La fecha indicada para lanzamiento revalida no es válida.';
              if (isNaN(date_recordatorio_limite_revalida))
                throw 'La fecha indicada para día limite contestación revalida (lanzamiento recordatorio) no es válida.';
                  
              var date_resultado_revalida = new Date(SpreadsheetApp.getActive().getRange('PROP_FECHA_LIMITE_REVALIDA').getValue());
              date_resultado_revalida.setDate(date_resultado_revalida.getDate()+1);
              var date_resultados = new Date(SpreadsheetApp.getActive().getRange('PROP_FECHA_LIMITE_TEST').getValue());
              date_resultados.setDate(date_recordatorio_limite_test.getDate()+1);
                    
      //version de prueba
              if (prueba)
              {
                    date_recordatorio_intermedio = new Date(today.getTime())
                    date_recordatorio_intermedio.setMinutes(today.getMinutes() + 15);
                    date_recordatorio_limite_test = new Date(today.getTime())
                    date_recordatorio_limite_test.setMinutes(today.getMinutes() + 20);
                    date_resultados = new Date(today.getTime())
                    date_resultados.setMinutes(today.getMinutes() + 25);
                    date_lanzamiento_revalida = new Date(today.getTime())
                    date_lanzamiento_revalida.setMinutes(today.getMinutes() + 27);
                    date_recordatorio_limite_revalida = new Date(today.getTime())
                    date_recordatorio_limite_revalida.setMinutes(today.getMinutes() + 30);
                    date_resultado_revalida = new Date(today.getTime())
                    date_resultado_revalida.setMinutes(today.getMinutes() + 35);
              }
              else
              {
                  date_recordatorio_intermedio.setHours(8);
                  date_recordatorio_limite_test.setHours(8);
                  date_resultados.setHours(5);
                  date_lanzamiento_revalida.setHours(8);
                  date_recordatorio_limite_revalida.setHours(8);
                  date_resultado_revalida.setHours(8);
              }   
            
      //creacion de los triggers, y si existen previos hay que cancelarlos, además actualizamos las fechas del proceso
            var trigger_a_eliminar=[];
            if (date_recordatorio_intermedio>today)
            {
              if (document_properties.getProperty('ID_TRIGGER_RECORDATORIO_INTERMEDIO'))
                trigger_a_eliminar.push(document_properties.getProperty('ID_TRIGGER_RECORDATORIO_INTERMEDIO'));
              SpreadsheetApp.getActive().getRange('SET_FECHA_RECORDATORIO_INTERMEDIO').setValue(date_recordatorio_intermedio);
              this_sheet.setFechaRecordatorioIntermedio(date_recordatorio_intermedio);
              document_properties.setProperty('ID_TRIGGER_RECORDATORIO_INTERMEDIO', ScriptApp.newTrigger("recordarCuestionario").timeBased().at(date_recordatorio_intermedio).create().getUniqueId());
            }
            if (date_recordatorio_limite_test>today)
            {
              if (document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE'))
                trigger_a_eliminar.push(document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE'));
              SpreadsheetApp.getActive().getRange('SET_FECHA_LIMITE_TEST').setValue(date_recordatorio_limite_test);
              this_sheet.setFechaLimiteTest(date_recordatorio_limite_test);
              document_properties.setProperty('ID_TRIGGER_RECORDATORIO_LIMITE', ScriptApp.newTrigger("recordarCuestionario").timeBased().at(date_recordatorio_limite_test).create().getUniqueId());
            }
            if (date_resultados>today)
            {
              if (document_properties.getProperty('ID_TRIGGER_RESULTADOS'))
                trigger_a_eliminar.push(document_properties.getProperty('ID_TRIGGER_RESULTADOS'));
              SpreadsheetApp.getActive().getRange('SET_FECHA_RESULTADOS').setValue(date_resultados);
              this_sheet.setFechaResultados(date_resultados);
              document_properties.setProperty('ID_TRIGGER_RESULTADOS', ScriptApp.newTrigger("mandarResultadosCuestionario").timeBased().at(date_resultados).create().getUniqueId());
            }
            if (date_lanzamiento_revalida>today)
            {
              if (document_properties.getProperty('ID_TRIGGER_LANZAMIENTO_REVALIDA'))
                trigger_a_eliminar.push(document_properties.getProperty('ID_TRIGGER_LANZAMIENTO_REVALIDA'));
              SpreadsheetApp.getActive().getRange('SET_FECHA_LANZAMIENTO_REVALIDA').setValue(date_lanzamiento_revalida);
              this_sheet.setFechaLanzamientoRevalida(date_lanzamiento_revalida);
              document_properties.setProperty('ID_TRIGGER_LANZAMIENTO_REVALIDA', ScriptApp.newTrigger("lanzarCuestionarioRevalida").timeBased().at(date_lanzamiento_revalida).create().getUniqueId());
            }
            if (date_recordatorio_limite_revalida>today)
            {
              if (document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE_REVALIDA'))
                trigger_a_eliminar.push(document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE_REVALIDA'));
              SpreadsheetApp.getActive().getRange('SET_FECHA_LIMITE_REVALIDA').setValue(date_recordatorio_limite_revalida);
              this_sheet.setFechaLimiteRevalida(date_recordatorio_limite_revalida);
              document_properties.setProperty('ID_TRIGGER_RECORDATORIO_LIMITE_REVALIDA', ScriptApp.newTrigger("recordarCuestionarioRevalida").timeBased().at(date_recordatorio_limite_revalida).create().getUniqueId());
            }
            if (date_resultado_revalida>today)
            {
              if (document_properties.getProperty('ID_TRIGGER_RESULTADO_REVALIDA'))
                trigger_a_eliminar.push(document_properties.getProperty('ID_TRIGGER_RESULTADO_REVALIDA'));
              SpreadsheetApp.getActive().getRange('SET_FECHA_RESULTADOS_REVALIDA').setValue(date_resultado_revalida);
              document_properties.setProperty('ID_TRIGGER_RESULTADO_REVALIDA', ScriptApp.newTrigger("recopilarRespuestasRevalidaTrigger").timeBased().at(date_resultado_revalida).create().getUniqueId());
            }
            //Logger.log('trigger_a_eliminar:'+JSON.stringify(trigger_a_eliminar));
            if (trigger_a_eliminar.length>0)
            {
              var triggers = ScriptApp.getProjectTriggers();
              triggers=triggers.filter(function(trigger){return trigger_a_eliminar.indexOf(''+trigger.getUniqueId())>-1;});
              //Logger.log('triggers:'+JSON.stringify(triggers.map(function(t){return t.getUniqueId();})));
              for (var i = 0; i < triggers.length; i++)
                ScriptApp.deleteTrigger(triggers[i]);
            }
            
            if (date_recordatorio_intermedio<today || date_recordatorio_limite_test<today || date_resultados<today || date_lanzamiento_revalida<today || date_recordatorio_limite_revalida<today)
              SpreadsheetApp.getUi().alert('Las siguientes fechas no serán tomadas en cuenta al ser anteriores a hoy (y los automatismos no se planificarán): \n'+
              '\n# lanzamiento de recordatorio intermedio:'+((date_recordatorio_intermedio<today)?'No':'Si')+
              '\n# dia límite de contestación test inicial (lanzamiento recordatorio):'+((date_recordatorio_limite_test<today)?'No':'Si')+
              '\n# comunicación de resultados:'+((date_resultados<today)?'No':'Si')+
              '\n# lanzamiento revalida:'+((date_lanzamiento_revalida<today)?'No':'Si')+
              '\n# día limite contestación revalida (lanzamiento recordatorio) :'+((date_recordatorio_limite_revalida<today)?'No':'Si')+
              '');
              
        var logging=new Logging();
        logging.newEventTexts('Correcto','Se han planificado los triggers en funcion de las fechas especificadas en la hoja.');

}

function stop_trigger(id_trigger)
{
              var triggers = ScriptApp.getProjectTriggers();
              for (var i = 0; i < triggers.length; i++)
              {
                if (triggers[i].getUniqueId()==id_trigger)
                {
                  ScriptApp.deleteTrigger(triggers[i]);
                  return true;
                }
              }
              return false;
}

function stop_trigger_recordatorio_intermedio()
{
     var document_properties = PropertiesService.getScriptProperties();
        var logging= new Logging('MANUAL(stop_trigger_recordatorio_intermedio)');
              if (document_properties.getProperty('ID_TRIGGER_RECORDATORIO_INTERMEDIO'))
                if (stop_trigger(document_properties.getProperty('ID_TRIGGER_RECORDATORIO_INTERMEDIO')))
                  logging.newEventTexts('Correcto','Cancelado Envio automatico recordatorio intermedio');
}
function stop_trigger_recodatorio_limite()
{
     var document_properties = PropertiesService.getScriptProperties();
        var logging= new Logging('MANUAL(stop_trigger_recodatorio_limite)');
              if (document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE'))
                if (stop_trigger(document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE')))
                  logging.newEventTexts('Correcto','Cancelado Envio automatico recordatorio limite');
}
function stop_trigger_resultados()
{
      var document_properties = PropertiesService.getScriptProperties();
       var logging= new Logging('MANUAL(stop_trigger_resultados)');
              if (document_properties.getProperty('ID_TRIGGER_RESULTADOS'))
                if (stop_trigger(document_properties.getProperty('ID_TRIGGER_RESULTADOS')))
                  logging.newEventTexts('Correcto','Cancelado Envio automatico resultados test inicial');
}
function stop_trigger_lanzamiento_revalida()
{
     var document_properties = PropertiesService.getScriptProperties();
        var logging= new Logging('MANUAL(stop_trigger_lanzamiento_revalida)');
              if (document_properties.getProperty('ID_TRIGGER_LANZAMIENTO_REVALIDA'))
                if (stop_trigger(document_properties.getProperty('ID_TRIGGER_LANZAMIENTO_REVALIDA')))
                  logging.newEventTexts('Correcto','Cancelado Envio automatico lanzamiento revalida');
}
function stop_trigger_recordatorio_limite_revalida()
{
     var document_properties = PropertiesService.getScriptProperties();
        var logging= new Logging('MANUAL(stop_trigger_recordatorio_limite_revalida)');
              if (document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE_REVALIDA'))
                if (stop_trigger(document_properties.getProperty('ID_TRIGGER_RECORDATORIO_LIMITE_REVALIDA')))
                  logging.newEventTexts('Correcto','Cancelado Envio automatico recordatorio revalida');
}
function stop_trigger_resultado_revalida()
{
      var document_properties = PropertiesService.getScriptProperties();
       var logging= new Logging('MANUAL(stop_trigger_resultado_revalida)');
              if (document_properties.getProperty('ID_TRIGGER_RESULTADO_REVALIDA'))
                if (stop_trigger(document_properties.getProperty('ID_TRIGGER_RESULTADO_REVALIDA')))
                  logging.newEventTexts('Correcto','Cancelado Recogida automatica revalida post fecha limite');
}
