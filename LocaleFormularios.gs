/**************************************************************************\
 * Copyright (C) 2018 by Synergic Partners                                 *
 *                                                                         *
 * author     : Borja Durán                                                *
 * description:                                                            *
 * - clases que agrupan por idioma determinado texto a la hora de generar los test      *
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


var LocaleFormularios = (function () {
    var instance;
 
    function createInstancia() {
        var this_sheet= new ThisSheet();        
        return (this_sheet.getPais().isLenguajeEnglish())?(new LocaleFormulariosEN()):(new LocaleFormulariosES());
    }
 
    return {
        getInstancia: function () {
            if (!instance) {
                instance = createInstancia();
            }
            return instance;
        }
    };
})();


function LocaleFormulariosES ()
{

    this._programa= (new ThisSheet()).getPrograma();
    this.getAgradecimientoMensaje= function()    {        return '¡Gracias por tu participación!';    }
    this.getSinConocimientoRespuesta= function()    {        return 'no lo sé.';    }
    
    //CHECK IN
    this.getExcelPreguntasCheckin= function()    {        return '1js9V-51sfeQqRRIRFps6t-dItHKbzdjVP7m6qundw-E';    }
    this.getTituloFormularioCheckin= function()    {        return 'Programa '+this._programa.getNombre()+' - Proceso de Check-in';    }
    this.getCabeceraTestCheckin= function(capabilities,numero_preguntas_total)    {        return 'El test contiene '+numero_preguntas_total+' preguntas con 4 opciones de respuesta (sólo una es correcta).\r\n'+
            'Evaluaremos tus conocimientos actuales en:\r\n\r\n'+
            capabilities.join('\r\n')+
            '\r\n\r\n'+
            'Por favor, NO busques las respuestas en Internet.\r\n'+
            'El objetivo es tener una visión clara de tus conocimientos actuales para ayudarte a alcanzar el nivel necesario antes del programa.\r\n\r\n'+
            'Una vez revisado el test se te comunicacarán los resultados y ofrecerte la formación previa que necesites.';    }
     
    //PREGUNTAS PROGRAMACION
    this.getTituloPreguntasCheckinProgramacion= function() { return 'Experiencia en Programación';    }
    this.getPregunta1CheckinProgramacion= function() { return '¿Cuándo fue la última vez que programaste?';    }
    this.getRespuestas1CheckinProgramacion= function() { return ['nunca','en los 3 últimos meses','de los 3 últimos meses a 1 año','de 1 a 3 años','más de 3 años'];    }
    this.getPregunta2CheckinProgramacion= function() { return 'De entre los siguientes lenguajes, ¿en cuáles puedes programar de una forma fluida?';    }
    this.getRespuestas2CheckinProgramacion= function() { return ['C','C++','Java','Fortran','matlab','R','Python','Scala','SQL','RSpark','PySpark','Spark en Scala'];    }
    
    
    //REVALIDA
    this.getExcelPreguntasRevalida= function()    {        return this.getExcelPreguntasCheckin();    }
    this.getTituloFormularioRevalida= function()    {        return this.getTituloFormularioCheckin();    }
    this.getCabeceraTestRevalida= function(capability,num_preguntas)    {        return 'El test contiene '+num_preguntas+' preguntas con 4 opciones de respuesta (sólo una es correcta).\r\n'+
                    'Evaluaremos tus conocimientos actuales en:\r\n\r\n'+
                    capability+
                    '\r\n\r\n'+
                    'Por favor, NO busques las respuestas en Internet.\r\n'+
                    'El objetivo es tener una visión clara de tus conocimientos actuales.';    }
    
        
    //CHECK OUT
    this.getExcelPreguntasCheckout= function()    {        return '1yLKUDqkr4ImuH07MWK34y7ElNztoQoQE1-ZxE2mBw9I';    }
    this.getCabeceraTestCheckout= function(capabilities,numero_preguntas_total)    {        return 'El test contiene '+numero_preguntas_total+' preguntas con 4 opciones de respuesta (sólo una es correcta).\r\n'+
            'Evaluaremos tus conocimientos actuales en:\r\n\r\n'+
            capabilities.join('\r\n')+
            '\r\n\r\n'+
            'Por favor, NO busques las respuestas en Internet.\r\n'+
            'El objetivo es tener una visión clara de tus conocimientos actuales.';    }
    this.getTituloFormularioCheckout= function()    {        return 'Programa '+this._programa.getNombre()+' - Proceso de Check-out';    }

                    
               
    
}


function LocaleFormulariosEN ()
{
    this._programa= (new ThisSheet()).getPrograma();

    this.getAgradecimientoMensaje= function()    {        return 'Thanks for your participation!';    }
    this.getSinConocimientoRespuesta= function()    {        return 'I don\'t know.';    }

    //CHECK IN
    this.getExcelPreguntasCheckin= function()    {        return '131IrNSZoCMROZR7PfOsYZ8ofjcJPrXOmVm2hwN69UP8';    }
    this.getTituloFormularioCheckin= function()    {        return this._programa.getNombre()+' Program - Check-in process';    }
    this.getCabeceraTestCheckin= function(capabilities,numero_preguntas_total)    {        return 'The test contains '+numero_preguntas_total+' questions with 4 answer options (only one is correct).\r\n'+
            'We will evaluate your current knowledge in:\r\n\r\n'+
            capabilities.join('\r\n')+
            '\r\n\r\n'+
            'Please, do NOT look for the answers on the Internet.\r\n'+
            'The objective is to have a clear vision of your current knowledge to help you reach the necessary level before the program.\r\n\r\n'+
            'Once the test is reviewed, the results will be communicated and the previous training you need will be offered.';    }
    
    //PREGUNTAS PROGRAMACION
    this.getTituloPreguntasCheckinProgramacion= function() { return 'Experience in Programming';    }
    this.getPregunta1CheckinProgramacion= function() { return 'When was the last time you programmed?';    }
    this.getRespuestas1CheckinProgramacion= function() { return ['never','in the last 3 months','from the last 3 months to 1 year','from 1 to 3 years', 'more than 3 years'];    }
    this.getPregunta2CheckinProgramacion= function() { return 'Among the following languages, in which are you a skilled programmer?';    }
    this.getRespuestas2CheckinProgramacion= function() { return ['C','C++','Java','Fortran','matlab','R','Python','Scala','SQL','RSpark','PySpark','Spark in Scala'];    }
    
    
    //REVALIDA
    this.getExcelPreguntasRevalida= function()    {        return this.getExcelPreguntasCheckin();    }
    this.getTituloFormularioRevalida= function()    {        return this.getTituloFormularioCheckin();    }
    this.getCabeceraTestRevalida= function(capability,num_preguntas)    {        return 'The test contains '+num_preguntas+' questions with 4 answer options (only one is correct).\r\n'+
                    'We will evaluate your current knowledge in:\r\n\r\n'+
                    capability+
                    '\r\n\r\n'+
            'Please, do NOT look for the answers on the Internet.\r\n'+
            'The objective is to have a clear vision of your current knowledge.\r\n\r\n';    }
    
    
    //CHECK OUT
    this.getExcelPreguntasCheckout= function()    {     throw 'El archivo no se ha configurado';   return '';    }
    this.getCabeceraTestCheckout= function(capabilities,numero_preguntas_total)    {        return 'The test contains '+numero_preguntas_total+' questions with 4 answer options (only one is correct).\r\n'+
            'We will evaluate your current knowledge in:\r\n\r\n'+
            capabilities.join('\r\n')+
            '\r\n\r\n'+
            'Please, do NOT look for the answers on the Internet.\r\n'+
            'The objective is to have a clear vision of your current knowledge to help you reach the necessary level before the program.\r\n\r\n';    }
    this.getTituloFormularioCheckout= function()    {        return this._programa.getNombre()+' Program - Check-out process';    }    
    
}