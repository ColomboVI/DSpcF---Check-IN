/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - clase que rescata los valores de la hoja de PROGRAMAS del archivo*
     PROGRAMAS Y EDICIONES asociados al valor_programa                    *
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

function Programa(valor_programa) {

  if (!valor_programa)
    throw 'Instancia de Programa mal creada: falta parametro valor_programa';

  if (typeof Programa.instancia === 'object') {
        return Programa.instancia;
    }


  // abrir hoja PROGRAMAS Y EDICIONES
  // https://docs.google.com/spreadsheets/d/17uYmVpkHS7zsN58Tt4U6vnb3qi_hQROEXRlDSFZOVSE/edit#gid=986432046
  var ss_programas=SpreadsheetApp.openById('17uYmVpkHS7zsN58Tt4U6vnb3qi_hQROEXRlDSFZOVSE').getSheetByName('PROGRAMAS');
  var tabla_programas= new Tabla(ss_programas,1, 1, ss_programas.getLastRow(), ss_programas.getLastColumn(),1);

  //comprobar que todos los programas tienen valores valores
  for (var i=1;i<=tabla_programas.getNumFilas();i++)
  {
    if (tabla_programas.getFila(i).filter(String).length !=tabla_programas.getFila(i).length)
    {
      throw('tabla de programas mal cargados, consultar: https://docs.google.com/spreadsheets/d/17uYmVpkHS7zsN58Tt4U6vnb3qi_hQROEXRlDSFZOVSE/edit#gid=986432046\n\nEl programa en posicion '+i+' no tiene completas todas las columnas');
    }
  }

  //COMPORBAR QUE EXISTE EL VALOR valor_programa
  var fila_programa=tabla_programas.getNumFilaColumnaIndexValue(valor_programa);

    //instanciar la clase Programa según el valor valor_programa
    Programa.instancia = new TipoPrograma(
                                  tabla_programas.getElementoFilaColumna(fila_programa,'PROGRAMA'),
                                  tabla_programas.getElementoFilaColumna(fila_programa,'ABREVIATURA'),
                                  tabla_programas.getElementoFilaColumna(fila_programa,'ID PLANTILLA EXCEL SEGUIMIENTO CHECK IN'),
                                  tabla_programas.getElementoFilaColumna(fila_programa,'ID CARPETA EDICIONES CHECK IN'),
                                  tabla_programas.getElementoFilaColumna(fila_programa,'ID PLANTILLA EVALUACIONES'),
                                  tabla_programas.getElementoFilaColumna(fila_programa,'ID PLANTILLA RESULTADOS')
                                  );

    return Programa.instancia;

}

function TipoPrograma(nombre, abreviatura,id_plantilla_excel_checkin,id_carpeta_checkin,id_plantilla_evaluaciones,id_plantilla_resultados)
{
  this._nombre=nombre;
  this._abreviatura=abreviatura;
  this._id_plantilla_excel_checkin=id_plantilla_excel_checkin;
  this._id_carpeta_checkin=id_carpeta_checkin;
  this._id_plantilla_evaluaciones=id_plantilla_evaluaciones;
  this._id_plantilla_resultados=id_plantilla_resultados;

  this.getNombre=function ()  {    return this._nombre;  }
  this.getAbreviatura=function ()  {    return this._abreviatura;  }
  this.getIdPlantillaExcelSeguimientoCheckIn=function ()  {    return this._id_plantilla_excel_checkin;  }
  this.getIdCarpetaEdicionesCheckIn=function ()  {    return this._id_carpeta_checkin;  }
  this.getIdArchivoEvaluaciones=function ()  {    return this._id_plantilla_evaluaciones;  }
  this.getIdArchivoResultados=function ()  {    return this._id_plantilla_resultados;  }
}


function pruebaPrograma()
{
var programa = new Programa('Data Scientist Fundamentals');
Logger.log('DS.abv='+programa.getAbreviatura());
Logger.log('DS.nombre='+programa.getNombre());
Logger.log('DS.id_eval='+programa.getIdArchivoEvaluacionesId());

}
