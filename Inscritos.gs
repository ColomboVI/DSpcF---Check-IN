/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - clase que a partir de los datos de la hoja Inscritos, crea una lista  *
*   de personas con dichos valores                                        *
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


function Inscritos() {

  if (typeof Inscritos.instancia === 'object') {
        return Inscritos.instancia;
    }

  //poblar con valores con la hoja Inscritos
  var ss=SpreadsheetApp.getActive().getSheetByName('Inscritos');
  this._tabla_referencia= new Tabla(ss,1, 1, ss.getLastRow(), ss.getLastColumn(),3);
  this.array=[];


  for (var i=1;i<=this._tabla_referencia.getNumFilas();i++)
  {
  var email=this._tabla_referencia.getElementoFilaColumna(i,'Email').toLowerCase().trim();
    //comprobar que los emails son válidos, sin caracteres raros
    if (!/^[a-z](([a-z0-9_\-]*\.)*[a-z0-9_\-]*[a-z0-9])*@([a-z][a-z0-9_\-]+\.)+[a-z]+$/.test(email))
        throw 'El email "'+email+'" de la hoja Inscritos no es correcto y no se podrá seguir con la automatización';


    if (!/@bbva.*\.(com)|(es)$/.test(this._tabla_referencia.getElementoFilaColumna(i,'Email(BBVA)').toLowerCase()))
    {
      if (!/@bbva.*\.(com)|(es)$/.test(email))
          throw 'El email "'+email+'" de la hoja Inscritos no es del bbva y por tanto debe completarse el correspondiente asociado en la columna Email(BBVA).';
      else
          this._tabla_referencia.setElementoFilaColumnaValor(i,'Email(BBVA)',email);
    }


     this.array.push(new Inscrito(
                 email,
                 this._tabla_referencia.getElementoFilaColumna(i,'Nombre'),
                 this._tabla_referencia.getElementoFilaColumna(i,'Test ID'),
                 this._tabla_referencia.getElementoFilaColumna(i,'Test inicial'),
                 this._tabla_referencia.getElementoFilaColumna(i,'Test Reválida'),
                 this._tabla_referencia.getElementoFilaColumna(i,'STATUS')
                 ));
      //pasamos el email a minusculas en la hoja y limpiamos espacios
      if (/[A-Z]+/.test(email) || / +/.test(email) )
        this._tabla_referencia.setElementoFilaColumnaValor(i,'Email',email);
  }

  Logger.log('array.length'+this.array.length)

  //metodos
  //se comprobará si existe valor contra el mail
  this.existeValor=function (valor)
  {
      var continuar=true,i=0;
      while (continuar && i<this.array.length)
      {
        if(this.array[i].getEmail()==valor)
          return true;
        i++;
      }
      return false;
  }


  this.getElementoValor=function (valor)
  {
      var continuar=true,i=0;
      while (continuar && i<this.array.length)
      {
        if(this.array[i].getEmail()==valor)
          return this.array[i];
        i++;
      }
      return ;
  }

  this.getElemento=function (valor)  {          return this.array[valor];  }

  this.getNumElementos=function()  {          return this.array.length;  }


    Inscritos.instancia = this;
}

function Inscrito(email, nombre, test_id, is_test_inicial_hecho,is_test_revalida_hecho,status) {
    this._email=email;
    this._nombre=nombre;
    if (isNaN(parseInt(test_id)))
      throw 'El inscrito '+email+' no tiene indicado un test_id correcto.';
    this._test_id=test_id;
    this._is_test_inicial_hecho=is_test_inicial_hecho;
    this._is_test_revalida_hecho=is_test_revalida_hecho;
    this._status=status;
    }

  Inscrito.prototype.getEmail=function ()  {    return this._email;  }
  Inscrito.prototype.getNombre=function ()  {    return this._nombre;  }
  Inscrito.prototype.getTestId=function ()  {    return this._test_id;  }
  Inscrito.prototype.isStatusBaja=function ()  {    return this._status=='Baja';  }
  Inscrito.prototype.isStatusSeleccionado=function ()  {    return this._status=='Seleccionado';  }
  Inscrito.prototype.isRealizadoTestConvocatoria=function ()  {    return this._is_test_inicial_hecho;  }
  Inscrito.prototype.isRealizadoTestRevalida=function ()  {    return this._is_test_revalida_hecho;  }