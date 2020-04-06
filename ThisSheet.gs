/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - es un Object unico que pretende preservar la configuración de check-in*
*   en función de valores de las celdas del excel y las distribucion de   *
*   archivos y directorios en torno a este excel                          *
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




/*** LISTADO DE FUNCIONES de la clase ThisSheet:
 ------------------------------
 + getPrograma: Obtener la clase Programa del curso asociado al check-in
 + getPais: Obtener la clase Pais del curso asociado al check-in
 + getQ: Obtener el Q# del curso asociado al check-in
 + getFechaIni: Obtener la fecha de inicio del curso asociado al check in

 + getFechaRecordatorioIntermedio: obtener la fecha configurada de RecordatorioIntermedio
 + getFechaLimiteTest: obtener la fecha configurada de LimiteTest
 + getFechaResultados: obtener la fecha configurada de Resultados
 + getFechaLanzamientoRevalida: obtener la fecha configurada de LanzamientoRevalida
 + getFechaLimiteRevalida: obtener la fecha configurada de LimiteRevalida

 + setFechaRecordatorioIntermedio: establecer la fecha RecordatorioIntermedio
 + setFechaLimiteTest: establecer la fecha LimiteTest
 + setFechaResultados: establecer la fecha para lanzar Resultados
 + setFechaLanzamientoRevalida: establecer la fecha de LanzamientoRevalida
 + setFechaLimiteRevalida: establecer la fecha LimiteRevalida

 + addTestInicial:  añadir un formulario y excel al conjunto de test iniciales
 + getRespuestasTestInicial: devolver los excel existentes de respuestas de los test que forman parte del test inicial
 + getFormulariosTestInicial: devolver los formularios existentes que forman parte del test inicial
 + addTestRevalida: añadir un formulario y excel al conjunto de test de revalida
 + getRespuestasRevalida: devolver los excel existentes de respuestas de los test que forman parte de la revalida
 + getFormulariosRevalida: devolver los formularios existentes que forman parte de la revalida
 + setDetalleCurso: Etablecer un PDF como detalle de programa asociado al curso
 + getDetalleCurso: Obtener el PDF de detalle de programa asociado al curso
***/

function ThisSheet() {

  if (typeof ThisSheet.instancia === 'object') {
        return ThisSheet.instancia;
    }
 //iniciamos variables privadas
 this._document_properties = PropertiesService.getScriptProperties();
 this._pais=new Pais(SpreadsheetApp.getActive().getRange('PAIS').getValue());
 this._programa=new Programa(SpreadsheetApp.getActive().getRange('PROGRAMA').getValue());
 this._q=SpreadsheetApp.getActive().getRange('Q').getValue();
 this._directorio=null;
 this._directorio_test_inicial=null;
 this._directorio_comunicaciones=null;
 this._directorio_revalida=null;
 this._directorio_resultados=null;
 this._detalle_curso=null;
 this._fecha_ini=new Date(SpreadsheetApp.getActive().getRange('FECHA_INI').getValue());
 //estas fechas se recuperan de las properties, no del excel para asegurar que no se cambian a mano en las celdas ya que tienen asociados triggers
 this._fecha_recordatorio_intermedio= function(date){return (date)?(new Date(date)):null;}(this._document_properties.getProperty('FECHA_RECORDATORIO_INTERMEDIO'));
 this._fecha_limite_test= function(date){return (date)?(new Date(date)):null;}(this._document_properties.getProperty('FECHA_LIMITE_TEST'));
 this._fecha_resultados= function(date){return (date)?(new Date(date)):null;}(this._document_properties.getProperty('FECHA_RESULTADOS'));
 this._fecha_lanzamiento_revalida= function(date){return (date)?(new Date(date)):null;}(this._document_properties.getProperty('FECHA_LANZAMIENTO_REVALIDA'));
 this._fecha_limite_revalida= function(date){return (date)?(new Date(date)):null;}(this._document_properties.getProperty('FECHA_LIMITE_REVALIDA'));

  //comprobar que los valores [Fecha Inicio] no están vacios para generar correctamente el directorio
  if(isNaN(this._fecha_ini))  {    throw ('La fecha establecida de inicio no es correcta');  }
   //comprobar que el valor de Q es válido
  if(!/20(1|2)\d\-Q(1|2|3|4)/.test(this._q))  {    throw ('El valor de Q (cuatrimestre) no es válido');  }

  //buscamos si existe ya el directorio, que será si este archivo esta contenido en una carpeta que contiene la palabra Edición
  var folders = DriveApp.getFileById(SpreadsheetApp.getActive().getId()).getParents(),encontrado=false,folder;
  while (!encontrado && folders.hasNext())
  {
    folder = folders.next();
    //Logger.log(folder.getName());
    encontrado=/Edición/.test(folder.getName());
  }
  if(encontrado)
  {
       this._directorio=folder;
       //como eciste la carpeta, buscamos si ya estan generadas el resto de otros directorios donde se almancenan ficheros
       folders = this._directorio.getFolders();
       while (folders.hasNext())
       {
         folder = folders.next();
         //Logger.log(folder.getName());
         if(/^0_Comunicaciones$/.test(folder.getName()))
           this._directorio_comunicaciones=folder;
         else if(/^1_TEST INICIAL$/.test(folder.getName()))
           this._directorio_test_inicial=folder;
         else if(/^2_TEST REVALIDA$/.test(folder.getName()))
           this._directorio_revalida=folder;
         else if(/^3_Resultados finales$/.test(folder.getName()))
           this._directorio_resultados=folder;
       }
    }

  this.getQ=function ()  {    return this._q;  }
  this.getPrograma=function ()  {    return this._programa;  }
  this.getPais=function ()  {    return this._pais;  }
  this.getFechaIni=function ()  {    return this._fecha_ini;  }

  //GETTERS DE FECHAS PLANIFICADAS
  //SI SE INTENTA ACCEDER A ELLAS SIN HABER ESTABLCECIDO EL VALOR ANTES SE LANZARA UNA EXCEPCIÓN
  this.getFechaRecordatorioIntermedio=function ()
  {
    if (this._fecha_recordatorio_intermedio && !isNaN(this._fecha_recordatorio_intermedio))
      return this._fecha_recordatorio_intermedio;
    throw 'FECHA_RECORDATORIO_INTERMEDIO no tiene un valor tipo fecha';
  }
  this.getFechaLimiteTest=function ()
  {
    if (this._fecha_limite_test && !isNaN(this._fecha_limite_test))
      return this._fecha_limite_test;
    throw 'FECHA_LIMITE_TEST no tiene un valor tipo fecha';
  }
  this.getFechaResultados=function ()
  {
    if (this._fecha_resultados && !isNaN(this._fecha_resultados))
      return this._fecha_resultados;
    throw 'FECHA_RESULTADOS no tiene un valor tipo fecha';
  }
  this.getFechaLanzamientoRevalida=function ()
  {
    if (this._fecha_lanzamiento_revalida && !isNaN(this._fecha_lanzamiento_revalida))
      return this._fecha_lanzamiento_revalida;
    throw 'FECHA_LANZAMIENTO_REVALIDA no tiene un valor tipo fecha';
  }
  this.getFechaLimiteRevalida=function ()
  {
    if (this._fecha_limite_revalida && !isNaN(this._fecha_limite_revalida))
      return this._fecha_limite_revalida;
    throw 'FECHA_LIMITE_REVALIDA no tiene un valor tipo fecha';
  }


  // SETTERS DE FECHAS PARA PLANIFICAIONES
    this.setFechaRecordatorioIntermedio=function (date)
  {
    this._fecha_recordatorio_intermedio=date;
    this._document_properties.setProperty('FECHA_RECORDATORIO_INTERMEDIO', date.getYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
  }
  this.setFechaLimiteTest=function (date)
  {
    this._fecha_limite_test=date;
    this._document_properties.setProperty('FECHA_LIMITE_TEST', date.getYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
  }
  this.setFechaResultados=function (date)
  {
    this._fecha_resultados=date;
    this._document_properties.setProperty('FECHA_RESULTADOS', date.getYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
  }
  this.setFechaLanzamientoRevalida=function (date)
  {
    this._fecha_lanzamiento_revalida=date;
    this._document_properties.setProperty('FECHA_LANZAMIENTO_REVALIDA', date.getYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
  }
  this.setFechaLimiteRevalida=function (date)
  {
    this._fecha_limite_revalida=date;
    this._document_properties.setProperty('FECHA_LIMITE_REVALIDA', date.getYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
  }

  //FUNCIONES PARA OBTENER LOS PRINCIPALES ARHIVOS INVOLUCRADOS EN EL CHECK-IN: TEST INICIAL, REVALIDA, DOCUMENTO DETALLE PROGRAMA

  this.addTestInicial = function (formulario){this._addFormulario(formulario,this._getDirectorioTestInicial());}
  this.getRespuestasTestInicial= function ()  {    return this._getFormulariosTestInicial(true);  }
  this.getFormulariosTestInicial= function ()  {    return this._getFormulariosTestInicial();  }
  this.addTestRevalida = function (formulario){this._addFormulario(formulario,this._getDirectorioRevalida());}
  this.getRespuestasRevalida= function ()  {    return this._getFormulariosRevalida(true);  }
  this.getFormulariosRevalida= function ()  {    return this._getFormulariosRevalida();  }
  this.setDetalleCurso=function (pdf_drive)
  {
      pdf_drive.setName(this._getPrefijoArchivos()+' - '+((this._pais.isLenguajeEnglish())?'Program Details':'Detalle del Programa'));
      this._getDirectorioComunicaciones().addFile(pdf_drive);
  }
  this.getDetalleCurso=function ()
  {
    if (this._detalle_curso)        {            return this._detalle_curso;        }
    //lo buscmaos ya que no se dispone
     var files = this._getDirectorioComunicaciones().getFiles(),encontrado=false,file;
    while (!encontrado && files.hasNext())
    {
      file = files.next();
      encontrado=/(Program Details)|(Detalle del Programa)/.test(file.getName());
    }
    if(encontrado)
    {
      this._detalle_curso=file;
      return this._detalle_curso;
    }
    throw "Detalle del curso no encontrado."
  }

  //FUNCIONES PRIVADAS PARA MANEJAR LOS FICHEROS Y CARPETAS

  this._getDirectorio=function ()
  {
        if (this._directorio)        {            return this._directorio;        }
        //creamos una nueva carpeta en alguno de los directorio en funcion del tipo de programa que sea
        var directorio_programa= DriveApp.getFolderById(this._programa.getIdCarpetaEdicionesCheckIn());
        var directory_name = this._getPrefijoLargoEdicion();
        this._directorio=directorio_programa.createFolder(directory_name);
        this._directorio.addFile(DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId()));

        var logging= new Logging();
        logging.newEventTextFormula('Crear directorio','=HYPERLINK("'+this._directorio.getUrl()+'";"'+this._directorio.getName()+'")');

        return this._directorio;
  }

  this._getPrefijoEdicion=function()
  {
    // actualmente se genera tal que asi [ABReviatura Pais] [Abreviatura Programa] [Q]
    return this._pais.getAbreviatura()+' '+this._programa.getAbreviatura()+' '+this._q;
  }

  this._getPrefijoArchivos=function()
  {
    // actualmente se genera tal que asi [ABReviatura Pais] [Abreviatura Programa] [Q]
    return this._pais.getAbreviatura()+' '+this._programa.getAbreviatura()
            +' '+this._q+' '+(this._fecha_ini.getYear()%2000)+(((this._fecha_ini.getMonth()+1)<10)?'0':'')+(this._fecha_ini.getMonth()+1)+((this._fecha_ini.getDate()<10)?'0':'')+this._fecha_ini.getDate();
  }

  this._getPrefijoLargoEdicion=function()
  {
    // se genera tal que asi getPrefijoEdicion + Edicion [DIA_INI][MES_INI][AÑO_INI] - [Pais]
    return this._getPrefijoEdicion()+
           ' Edición '+this._fecha_ini.getDate()+' '+meses[this._fecha_ini.getMonth()]+' '+(this._fecha_ini.getYear()%2000)+' - '+this._pais.getNomenclaturaFicheros() ;
  }

  this._addFormulario = function (formulario,carpeta){

      var formulario_drive= DriveApp.getFileById(formulario.getFormulario().getId());
      formulario_drive.setName(this._getPrefijoArchivos()+' '+formulario_drive.getName());
      carpeta.addFile(formulario_drive);

      var excel_drive= DriveApp.getFileById(formulario.getExcelAsociado().getId());
      excel_drive.setName(formulario_drive.getName()+' (respuestas)');
      carpeta.addFile(excel_drive);

    }


  this._getDirectorioTestInicial = function () {
      if (this._directorio_test_inicial)        {            return this._directorio_test_inicial;        }
      this._directorio_test_inicial=this._getDirectorio().createFolder('1_TEST INICIAL');
      return this._directorio_test_inicial;
    }

  this._getDirectorioRevalida = function () {
      if (this._directorio_revalida)        {            return this._directorio_revalida;        }
      this._directorio_revalida=this._getDirectorio().createFolder('2_TEST REVALIDA');
      return this._directorio_revalida;
    }
  this._getDirectorioResultados = function () {
      if (this._directorio_resultados)        {            return this._directorio_resultados;        }
      this._directorio_resultados=this._getDirectorio().createFolder('3_Resultados finales');
      return this._directorio_resultados;
    }

  this._getDirectorioComunicaciones = function () {
      if (this._directorio_comunicaciones)        {            return this._directorio_comunicaciones;        }
      this._directorio_comunicaciones=this._getDirectorio().createFolder('0_Comunicaciones');
      return this._directorio_comunicaciones;
    }

 this._getFormulariosTestInicial= function (excel_responses)
  {
      var form ={},folder=this._getDirectorioTestInicial();

       var files = folder.getFiles();
       while (files.hasNext())
       {
         var file = files.next();
         if((excel_responses && /Check-in \d+ \(respuestas\)$/.test(file.getName())) ||
            (!excel_responses && /Check-in \d+$/.test(file.getName())))
         {
           var i=(/Check-in (\d+)/.exec(file.getName())[1]);
           Logger.log(file.getName());
           form[i]=file;
         }
       }
    return form;
  }

  this._getFormulariosRevalida= function (excel_responses)
  {
      var directorio_revalida=this._getDirectorioRevalida();
      var versiones={};

      var files = directorio_revalida.getFiles();
      while (files.hasNext())
      {
        var file = files.next();
        if((excel_responses && /Check-in \d+ REV \S+ \(respuestas\)$/.test(file.getName())) ||
          (!excel_responses && /Check-in \d+ REV \S+$/.test(file.getName())))
          {
            var resultado_regexp= /Check-in (\d+) REV (\S+)/.exec(file.getName());
            var test_id=resultado_regexp[1];
            var capability=resultado_regexp[2];
            if (!versiones[test_id])
              versiones[test_id]={};
            versiones[test_id][capability]=file;
          }
      }
      return versiones;
  }

    ThisSheet.instancia = this;
    //return this;
}



function pruebaThisSheet()
{
var this_sheet= new ThisSheet();
Logger.log('Q:'+this_sheet.getQ());
Logger.log((this_sheet._directorio_resultados)?('Directorio Reswultados'+this_sheet._directorio_resultados.getName()):'Aun no tiene directorio resultados creado');
Logger.log((this_sheet.getDirectorio())?('Directorio'+this_sheet.getDirectorio().getName()):'Aun no tiene directorio creado');
Logger.log((this_sheet.getDirectorioTestInicial())?('Directorio'+this_sheet.getDirectorioTestInicial().getName()):'Aun no tiene directorio creado');
Logger.log(this_sheet.getPrefijoEdicion());
Logger.log(this_sheet.getPrefijoLargoEdicion());
Logger.log(  this_sheet.getFechaRecordatorioIntermedio ());
Logger.log(  this_sheet.getFechaLimiteTest ());
Logger.log(  this_sheet.getFechaResultados ());
Logger.log(  this_sheet.getFechaLanzamientoRevalida ());
Logger.log(  this_sheet.getFechaLimiteRevalida ());

}
