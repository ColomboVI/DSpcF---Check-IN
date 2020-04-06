/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - clase que a partir de los datos de la hoja de REPORT y crea una lista *
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

function ReportParticipantes() {

  if (typeof ReportParticipantes.instancia === 'object') {
        return ReportParticipantes.instancia;
    }
  
  //poblar con valores con la hoja REPORT
  var ss=SpreadsheetApp.getActive().getSheetByName('REPORT');
  this._tabla_referencia= new Tabla(ss,1, 1, ss.getLastRow(), ss.getLastColumn(),3);
  this.array=[];
  
  
  var capability_list= new CapabilityList();
  for (var i=1;i<=this._tabla_referencia.getNumFilas();i++)
  {
        var debilidades=[],cadena=this._tabla_referencia.getElementoFilaColumna(i,'Plan de choque');
        
        while (cadena && cadena.length!=0)
        {
          var res = /^MOOC de ([^\r]+)\r?\n?/.exec(cadena);
          debilidades.push(capability_list.getValor(res[1]));
          cadena=cadena.substr(res[0].length);
        }
        this.array.push(new Participante(
          this._tabla_referencia.getElementoFilaColumna(i,'Email'),
          this._tabla_referencia.getElementoFilaColumna(i,'Nombre'),
          this._tabla_referencia.getElementoFilaColumna(i,'Test ID'),
          this._tabla_referencia.getElementoFilaColumna(i,'Email(BBVA)'),
          debilidades,
          this._tabla_referencia.getElementoFilaColumna(i,'LEYENDA'),
          this._tabla_referencia.getElementoFilaColumna(i,'REVALIDA'),
          this._tabla_referencia.getElementoFilaColumna(i,'REVALIDA realizada'),
          this._tabla_referencia.getElementoFilaColumna(i,'STATUS')
        ));
  }
  //Logger.log('array.length'+this.array.length)


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
  
  
  
    ReportParticipantes.instancia = this;
    //return this;
}



function Participante(email, nombre, test_id, emailBBVA, plan_de_choque, leyenda, is_needed_revalida,is_done_revalida,status)
{

    this._email=email.toLowerCase().trim();
    this._emailBBVA=emailBBVA.toLowerCase().trim();
    this._nombre=nombre;
    this._status=status;
    if (isNaN(parseInt(test_id)))
      throw 'El participante '+email+' no tiene indicado un test_id correcto.';
    this._test_id=test_id;
    this._plan_de_choque=plan_de_choque;
    this._leyenda=leyenda;
    this._is_needed_revalida=is_needed_revalida;
    this._is_done_revalida=is_done_revalida=='SI';
}
        
  Participante.prototype.isStatusBaja=function ()  {    return this._status=='Baja';  }
  Participante.prototype.isStatusSeleccionado=function ()  {    return this._status=='Seleccionado';  }
  Participante.prototype.getEmail=function ()  {    return this._email;  }
  Participante.prototype.getEmailBBVA=function ()  {    return this._emailBBVA;  }
  Participante.prototype.getNombre=function ()  {    return this._nombre;  }
  Participante.prototype.getTestId=function ()  {    return this._test_id;  }
  Participante.prototype.getPlanDeChoque=function ()  {    return this._plan_de_choque;  }
  Participante.prototype.getLeyenda=function ()  {    return this._leyenda;  }
  Participante.prototype.isNeededRevalida=function ()  {    return this._is_needed_revalida;  }
  Participante.prototype.isDoneRevalida=function ()  {    return this._is_done_revalida;  }



function pruebainscritos()
{
var participantes = new ReportParticipantes();
var inscritos = new Inscritos();
Logger.log(JSON.stringify(participantes))
Logger.log(JSON.stringify(inscritos));
Logger.log('participante bduran@synergicpartners.com? '+participantes.existeValor("bduran@synergicpartners.com"));
Logger.log('inscrito bduran@synergicpartners.com? '+inscritos.existeValor("bduran@synergiacpartners.com"));
if(participantes.existeValor("bduran@synergicpartners.com")){
Logger.log('participante elemento 0->nombre? '+participantes.getElemento(0).getNombre());

Logger.log('participante bduran@synergicpartners.com->nombre? '+participantes.getElementoValor("bduran@synergicpartners.com").getNombre());
Logger.log('participante bduran@synergicpartners.com->test? '+participantes.getElementoValor("bduran@synergicpartners.com").getTestId());
Logger.log('participante bduran@synergicpartners.com->leyenda? '+participantes.getElementoValor("bduran@synergicpartners.com").getLeyenda());
Logger.log('participante bduran@synergicpartners.com->cursos? '+JSON.stringify(participantes.getElementoValor("bduran@synergicpartners.com").getPlanDeChoque()));
Logger.log('participante bduran@synergicpartners.com->revalida? '+participantes.getElementoValor("bduran@synergicpartners.com").isNeedRevalida()==null);
}


if(inscritos.existeValor("bduran@synergicpartners.com")){
Logger.log('inscrito elemento 0->nombre? '+participantes.getElemento(0).getNombre());

Logger.log('inscrito bduran@synergicpartners.com->nombre? '+inscritos.getElementoValor("bduran@synergicpartners.com").getNombre());
Logger.log('inscrito bduran@synergicpartners.com->test? '+inscritos.getElementoValor("bduran@synergicpartners.com").getTestId());
Logger.log('inscrito bduran@synergicpartners.com->testrealizado? '+((inscritos.getElementoValor("bduran@synergicpartners.com").isRealizadoTestConvocatoria())?'si':'no'));
Logger.log('inscrito bduran@synergicpartners.com->testrealizado? '+((inscritos.getElementoValor("bduran@synergicpartners.com").isRealizadoTestRevalida())?'si':'no'));
}

}