/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - clase que a partir de los datos de la hoja de MOOCS del archivo       *
    PROGRAMAS Y EDICIONES y crea una lista con capabilities y MOOCs corresponidentes*
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

function CapabilityList() {

  if (typeof CapabilityList.instancia === 'object') {
        return CapabilityList.instancia;
    }
    CapabilityList.instancia = this;


  var pais = (new ThisSheet()).getPais();
  this._list={};

  // abrir hoja PROGRAMAS Y EDICIONES
  // https://docs.google.com/spreadsheets/d/17uYmVpkHS7zsN58Tt4U6vnb3qi_hQROEXRlDSFZOVSE/edit#gid=578484821
  var ss_moocs=SpreadsheetApp.openById('17uYmVpkHS7zsN58Tt4U6vnb3qi_hQROEXRlDSFZOVSE').getSheetByName('MOOCS');
  var tabla_moocs= new Tabla(ss_moocs,1, 1, ss_moocs.getLastRow(), ss_moocs.getLastColumn(),1);


  //comprobar que todos los programas tienen valores valores
  for (var i=1;i<=tabla_moocs.getNumFilas();i++)
  {
    if (tabla_moocs.getFila(i).filter(String).length !=tabla_moocs.getFila(i).length)
    {
      throw('tabla de MOOCS mal configurada, consultar: https://docs.google.com/spreadsheets/d/17uYmVpkHS7zsN58Tt4U6vnb3qi_hQROEXRlDSFZOVSE/edit#gid=578484821\n\nEl MOOC en posicion '+i+' no tiene valores para todas las columnas');
    }

  //generar estructura para recorrer valores y llenarla con objetos capability
    this._list[tabla_moocs.getElementoFilaColumnaIndex(i)]=new Capability(
                          tabla_moocs.getElementoFilaColumnaIndex(i),
                          tabla_moocs.getElementoFilaColumna(i,(pais.isLenguajeEnglish())?'[EN] Nombre capability completo':'[ES] Nombre capability completo'),
                          tabla_moocs.getElementoFilaColumna(i,(pais.isLenguajeEnglish())?'[EN] Nombre curso':'[ES] Nombre curso'),
                          tabla_moocs.getElementoFilaColumna(i,(pais.isLenguajeEnglish())?'[EN] Dirección BBVA':'[ES] Dirección BBVA')
                          );

  }
  //Logger.log(JSON.stringify(this._list));

  //funciones para obtener referencias a los objetos capability
  this.getValor=function (valor)
  {
      if (!this._list[valor])
        throw "No existe la capability: "+valor;
      return this._list[valor];
  }
}


function Capability(id,nombre, nombre_curso, link_curso) {
  this._id=id;
  this._nombre=nombre;
  this._nombre_curso=nombre_curso;
  this._link_curso=link_curso;

  this.getId=function (valor)  {    return this._id;  }
  this.getNombre=function (valor)  {    return this._nombre;  }
  this.getNombreMOOC=function (valor)  {    return this._nombre_curso;  }
  this.getLinkMOOC=function (valor)  {    return this._link_curso;  }
}



function pruebaCapabilityList()
{
var capabilities = new CapabilityList();
Logger.log('SQL.nombre='+capabilities.getValor('SQL').getNombre());
Logger.log('ML.mooc='+capabilities.getValor('ML').getNombreMOOC());
Logger.log('R.addr='+capabilities.getValor('R').getLinkMOOC());
Logger.log('Spark.addr='+capabilities.getValor('Spark').getLinkMOOC());

}