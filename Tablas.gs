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
 + getFila: devuelve los valores de una fila como un array [valor_index, valor1, valor2, valor3]
 + getFilaComoObjeto: devuelve los valores de una fila como un objeto, de propiedades las nombre de columnas asociados a los valores 
                        {columna_index:valor_index, columna1:valor1, columna2:valor2...}
 + getFilaComoObjetoValores: devuelve un objeto con propiedades (COLUMNA_INDEX y valores) que recogen los valroes
                       {columna_index: valor_index, valores:[{item:columna1, valor:valor1},{item:columna2, valor:valor2}...]}
 + getElementoFilaColumna: devuelve el valor para una fila de una columna
 + getElementoFilaColumnaIndex: devuelve el valor para una fila de una columna index
 + getNumFilaColumnaIndexValue: devuelve el numero de fila para un valor de columna index indicado
 + getNumFilas: devuelve el numero de filas de la tabla
 + setElementoFilaColumnaValor: establece un valor para una columna de una fila de la tabla
***/



/****************************************************************************************************
 * Devuelve una estructura para consultar los valores definidos en una tabla de una hoja
 * @param {number} ss_sheet  hoja de excel donde se situa la tabla
 * @param {number} i0        indice de fila donde comienza la tabla [1,N]
 * @param {number} j0        indice de columna donde comienza la tabla [1,N]
 * @param {number} long_i    numero de filas de longitud de la tabla
 * @param {number} long_j    numero de columnas de longitud de la tabla
 * @param {number} index     numero de columna que actuara de indice y nunca podra estar vacia [1,N]
 * @returns {Object}         objeto para leer valores de una tabla
 
 * @EXCEPTION:
   - cuando se le indique dar el valor en una columna con nombre no existente
   - cuando se le indique dar el valor de una fila con numero <1 y > longitud de elementos
   - cuando se le indique obtener la fila para un valor de index no existente
 
 */
  
function Tabla(ss_sheet,i0,j0,long_i, long_j, index) {

  //funcion de filtro para eliminar de la tabla las filas cuyo indice no este vacio
  var filtrarIndiceNoVacio = function (array) {return array[index-1] && !/^$/.test(array[index-1]);};
  //obtenemos como array los valores de la tabla indicada por los valores i0, j0, long_i, long_j y filtrada pra que en la columna index siempre haya un valor
  this._vars=ss_sheet.getRange(i0, j0, long_i, long_j).getValues()
          //insertamos el indice real al final de la fila
          .map(function(item,index){item.push(index);return item;})
          /*.map(function(item){return item.trim();})*/
          //nos quedamos solo con las filas cuyo index no está vacio
          .filter(filtrarIndiceNoVacio);
  this._index=index-1;
  
  this._ss_sheet=ss_sheet;
  this._j0=j0;
  this._i0=i0;
  
  //Logger.log('valores recuperados de Tabla')
  //Logger.log(JSON.stringify(this._vars)) 
  
  this.getFila=function (i)  {         return this._vars[i].slice(0,-1);  }
  this.getFilaComoObjeto=function (i)
  {
        var objeto={};
        this._vars[0].slice(0,-1).forEach(function(valores){return function(item,pos){this[item]=valores[pos];}}(this._vars[i].slice(0,-1)),objeto);
         return objeto;
  }
  
  this.getFilaComoObjetoValores=function (i)
  {
        var objeto={};
        objeto[this._vars[0][0]]=this._vars[i][0];
        objeto.valores=[];
        this._vars[0].slice(1,-1).forEach(function(valores){return function(item,pos){this.valores.push({'item':item,'valor':valores[pos]})}}(this._vars[i].slice(1)),objeto);
         return objeto;
  }
  
  this._getSpreadsheetFila=function (i)
  {
        //hemos guardado en el ultimo elemento de una fila el indice de verdad
         return this._vars[i][this._vars[i].length-1]+this._i0;
  }
  
  this._getPosicionColumna=function (nombre_columna)
  {
          var j=this._vars[0].indexOf(nombre_columna);
          
          if(j==-1)
            throw ('Columna no encontrada:'+nombre_columna);
          
          return j;
  }
  
  this.getElementoFilaColumna=function (i,nombre_columna)
  {
          if (i<1)
            throw ('indice fila debe ser mayor que 0');
          else if (i>this.getNumFilas())
            throw ('indice fila debe ser menor o igual que numero máximo de elementos: '+this.getNumFilas());
          
            
          var j=this._getPosicionColumna(nombre_columna);          
          return this._vars[i][j];
  }
  
  this.getElementoFilaColumnaIndex=function (i)
  {
          if (i<1)
            throw ('indice fila debe ser mayor que 0');
          else if (i>this.getNumFilas())
            throw ('indice fila debe ser menor o igual que numero máximo de elementos: '+this.getNumFilas());
                   
          return this._vars[i][this._index];
  }
  
  this.getNumFilaColumnaIndexValue=function (value,i_start)
  {
          var i=i_start?i_start:1;
          if (i<1)
            throw ('indice fila debe ser mayor que 0');
          else if (i>this.getNumFilas())
            throw ('indice fila debe ser menor o igual que numero máximo de elementos: '+this.getNumFilas());
          while(i<=this.getNumFilas())
          {
            if(this.getElementoFilaColumnaIndex(i)==value)
              return i;
            i++;
          }
          throw ('No se ha encontrado el valor:'+value);
  }
  
  this.getNumFilas=function()
  {
          return this._vars.length-1;
  }

   this.setElementoFilaColumnaValor=function (i,nombre_columna,valor)
  {
          if (i<1)
            throw ('indice fila debe ser mayor que 0');
          else if (i>this.getNumFilas())
            throw ('indice fila debe ser menor o igual que numero máximo de elementos: '+this.getNumFilas());
          
            
          var j=this._getPosicionColumna(nombre_columna);          
          this._vars[i][j]=valor;
          this._ss_sheet.getRange(this._getSpreadsheetFila(i), this._j0+j).setValue(valor)
  }
  
 
  
}

function pruebaTablas ()
{
var ss=SpreadsheetApp.getActive().getSheetByName('Inscritos');
var tabla_inscritos = new Tabla(ss, 1,1,ss.getLastRow(),ss.getLastColumn(),3)

Logger.log('fila:'+JSON.stringify(tabla_inscritos.getFila(2)));
Logger.log('num fila de (forrest.fletcherd@bbva.com):'+tabla_inscritos.getNumFilaColumnaIndexValue('forrest.fletchder@bbva.com'));
Logger.log('pos col:'+tabla_inscritos.getPosicionColumna('Test Reválida'));
Logger.log('val col index:'+tabla_inscritos.getElementoFilaColumnaIndex(1));
Logger.log('fila columna:'+tabla_inscritos.getElementoFilaColumna(3,'Area de negocio'));
Logger.log('numfilas:'+tabla_inscritos.getNumFilas());

}
