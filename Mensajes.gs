/**************************************************************************\
* Copyright (C) 2018 by Synergic Partners                                 *
*                                                                         *
* author     : Borja Durán                                                *
* description:                                                            *
* - recopila una clase Mensaje personalizada por cada idioma que          *
*    establecera el contenido de los emails que se envían                 *
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



/*** LISTADO DE FUNCIONES de la clase Mensajes (ESPAÑOL->MensajesES // INGLES->MensajesEN ):
 ------------------------------
 + getMensajeEmailRecordatorio
 + getMensajeEmailRecordatorioTXT
 + getMensajeEmailResultadoApto
 + getMensajeEmailResultadoAptoTXT
 + getMensajeEmailResultadoNoApto
 + getMensajeEmailResultadoNoAptoTXT
 + getMensajeEmailResultadoNoValido
 + getMensajeEmailResultadoNoValidoTXT
 + getMensajeEmailRevalida
 + getMensajeEmailRevalidaTXT
 + getMensajeEmailRecordatorioRevalida
 + getMensajeEmailRecordatorioRevalidaTXT
 + getMensajeEmailConvocatoriaTXT
 + getMensajeEmailCheckout
 + getMensajeEmailCheckoutTXT
***/



var Mensajes = (function () {
    var instance; 
    function createInstancia() {
        
        return ((new ThisSheet()).getPais().isLenguajeEnglish())?(new MensajesEN()):(new MensajesES());
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

var meses =[ 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
var dias =[ 'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado' ];
var meses_EN =[ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var dias_EN =[ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

function MensajesES ()
{
    this._programa = (new ThisSheet()).getPrograma();        
    this._getColetilla= function()    {        return '<b>¡Aprovecha</b> <r>tu oportunidad!</r>\n';    }
    this._eliminarFormato= function(text)    {        return text.replace(/<[^>]+>/g,'');    }
    this._getFechaLocale= function(fecha)    {        return dias[fecha.getDay()]+' '+fecha.getDate()+' de '+meses[fecha.getMonth()];    }
    this.getAsuntoEmail= function()    {      return "Campus BBVA: Programa "+this._programa.getNombre();    }
    
    this.getMensajeEmailRecordatorio= function(pdf_detalle,formulario,fecha_limite_test)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_test.getDate())?'hoy, ':'')+this._getFechaLocale(fecha_limite_test);
        return '<r>Hola,</r>\n'+
              'Estos días recibiste la invitación a participar en el proceso de check-in de: <r>'+
              '<a href="'+pdf_detalle.getUrl()+'" target="_blank">Programa '+this._programa.getNombre()+'</a></r>\n'+
              'Recuerda que la fecha límite para responder al test del check-in es <b>'+fecha+'</b>.\n'+
              '<a href="'+formulario.getPublishedUrl()+'">Comenzar test</a>\n'+
              this._getColetilla();
    
    }
    this.getMensajeEmailRecordatorioTXT= function(pdf_detalle,formulario,fecha_limite_test)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_test.getDate())?'hoy, ':'')+this._getFechaLocale(fecha_limite_test);
        return 'Hola.\n\nEstos días recibiste la invitación a participar en el proceso de check-in de: Programa '+this._programa.getNombre()+' (más información aquí: '+pdf_detalle.getUrl()+').\n'+
                'Recuerda que la fecha límite para responder al test del check-in es '+fecha+'.\n'+
                'Comenzar test:'+formulario.getPublishedUrl()+'\n'+
              this._eliminarFormato(this._getColetilla()); 
    }
    
    this.getMensajeEmailResultadoApto= function(participante)
    {
    return '<r>Hola '+participante.getNombre()+'</r>,\n'+
            'Has obtenido <b>un buen resultado</b> en el test de check-in para el <r>Programa '+this._programa.getNombre()+'</r>.\n'+
            'Enhorabuena <b>tienes los conocimientos básicos requeridos para realizar el curso</b>.\n'+
            'En las próximas semanas un tutor podría ponerse en contacto contigo para realizar una entrevista corta (10 min) para conocerte y verificar los resultados del test.\n'+
            this._getColetilla();
    }
    this.getMensajeEmailResultadoAptoTXT= function(participante){return this._eliminarFormato(this.getMensajeEmailResultadoApto(participante));}
    
    this.getMensajeEmailResultadoNoApto= function(participante,fecha_revalida)
    {
    return '<r>Hola '+participante.getNombre()+'</r>,\n'+
            'Has obtenido <b>un buen resultado</b> en el test de check-in para el <r>Programa '+this._programa.getNombre()+'</r>.\n'+
            'Solo debes reforzar algunos conocimientos con tu plan formativo express.\n'+
            'Realiza estos cursos (MOOCs) antes del <b>'+this._getFechaLocale(fecha_revalida)+'</b>:\n'+
            '<ul>'+participante.getPlanDeChoque().map(function(capability){return '<li><a href="'+capability.getLinkMOOC()+'">'+capability.getNombreMOOC()+'</a></li>'}).join('')+'</ul>'+ // '#Introducción a la Estadística'+ 
            'Después <b>recibirás un nuevo test de conocimiento</b> para comprobar si has alcanzado el nivel necesario y así ser convocado al Programa.\n'+
            'En las próximas semanas un tutor pondría ponerse en contacto contigo para realizar una entrevista corta (10 min) para conocerte y verificar los resultados del test.\n'+
            this._getColetilla();
    
    }    
    this.getMensajeEmailResultadoNoAptoTXT= function(participante,fecha_revalida)
    {
    return this._eliminarFormato('<r>Hola '+participante.getNombre()+'</r>,\n'+
            'Has obtenido <b>un buen resultado</b> en el test de check-in para el <r>Programa '+this._programa.getNombre()+'</r>.\n'+
            'Solo debes reforzar algunos conocimientos con tu plan formativo express.\n'+
            'Realiza estos cursos (MOOCs) antes del <b>'+this._getFechaLocale(fecha_revalida)+'</b>:\n')+
            participante.getPlanDeChoque().map(function(capability){return '#'+capability.getNombreMOOC()+': '+capability.getLinkMOOC()+'\n'}).join('')+ // '#Introducción a la Estadística: link'+ 
            this._eliminarFormato('Después <b>recibirás un nuevo test de conocimiento</b> para comprobar si has alcanzado el nivel necesario y así ser convocado al Programa.\n'+
            'En las próximas semanas un tutor pondría ponerse en contacto contigo para realizar una entrevista corta (10 min) para conocerte y verificar los resultados del test.\n')+
            this._eliminarFormato(this._getColetilla());      
    }
    
     
      /************************
    MENSAJE CON PDF
    ****************************/
    
    this.getMensajeEmailResultadoNoAptoPDF= function(participante,fecha_revalida)
    {
    return '<r>Hola '+participante.getNombre()+'</r>,\n'+
            'Has obtenido <b>un buen resultado</b> en el test de check-in para el <r>Programa '+this._programa.getNombre()+'</r>.\n'+
            'Solo debes reforzar algunos conocimientos con tu plan formativo express.\n'+
            'Realiza estos cursos (MOOCs) antes del <b>'+this._getFechaLocale(fecha_revalida)+'</b>:\n'+
            '<ul>'+participante.getPlanDeChoque().map(function(capability){return '<li><a href="'+capability.getLinkMOOC()+'">'+capability.getNombreMOOC()+'</a></li>'}).join('')+'</ul>'+ // '#Introducción a la Estadística'+ 
            'Además del MOOC, deberás <b>reforzar</b> tus conocimientos con el <b>libro recomendado</b> cuyo enlace y guia de lectura puedes ver en el fichero adjunto.\n'+
            'Después <b>recibirás un nuevo test de conocimiento</b> para comprobar si has alcanzado el nivel necesario y así ser convocado al Programa.\n'+
            'En las próximas semanas un tutor pondría ponerse en contacto contigo para realizar una entrevista corta (10 min) para conocerte y verificar los resultados del test.\n'+
            this._getColetilla();
    
    }    
    this.getMensajeEmailResultadoNoAptoPDFTXT= function(participante,fecha_revalida)
    {
    return this._eliminarFormato('<r>Hola '+participante.getNombre()+'</r>,\n'+
            'Has obtenido <b>un buen resultado</b> en el test de check-in para el <r>Programa '+this._programa.getNombre()+'</r>.\n'+
            'Solo debes reforzar algunos conocimientos con tu plan formativo express.\n'+
            'Realiza estos cursos (MOOCs) antes del <b>'+this._getFechaLocale(fecha_revalida)+'</b>:\n')+
            participante.getPlanDeChoque().map(function(capability){return '#'+capability.getNombreMOOC()+': '+capability.getLinkMOOC()+'\n'}).join('')+ // '#Introducción a la Estadística: link'+ 
            this._eliminarFormato( 'Además del MOOC, deberás <b>reforzar</b> tus conocimientos con el <b>libro recomendado</b> cuyo enlace y guia de lectura puedes ver en el fichero adjunto.\n'+
            'Después <b>recibirás un nuevo test de conocimiento</b> para comprobar si has alcanzado el nivel necesario y así ser convocado al Programa.\n'+
            'En las próximas semanas un tutor pondría ponerse en contacto contigo para realizar una entrevista corta (10 min) para conocerte y verificar los resultados del test.\n')+
            this._eliminarFormato(this._getColetilla());      
    }
    
    this.getMensajeEmailResultadoNoValido= function(participante)
    {
    return '<r>Hola '+participante.getNombre()+'</r>,\n'+
            'Gracias por participar en el check-in para el <r>Programa '+this._programa.getNombre()+'</r>.\n'+
            'Desde el área de Data o Employee Experience se pondrán en contacto contigo en las próximas semanas para comunicarte el estado de tu candidatura.\n'+
            this._getColetilla();

    }
    this.getMensajeEmailResultadoNoValidoTXT= function(participante){return this._eliminarFormato(this.getMensajeEmailResultadoNoValido(participante));}
    
    this.getMensajeEmailRevalida= function(participante,fecha_limite_revalida,tests_revalida)
    {
    return '<r>Hola '+participante.getNombre()+'</r>,\n'+
          'Como parte del proceso de check-in de <r>Programa '+this._programa.getNombre()+'</r> te enviamos una serie de preguntas de comprobación de nivel básico adquirido en las capabilities especificadas durante la primera fase.\n'+
          '<ul>'+tests_revalida.map(function(test_revalida){return '<li><a href="'+test_revalida.formulario.getPublishedUrl()+'">Comenzar test en '+test_revalida.capability+'</a></li>'}).join('')+'</ul>\n' /*'#Comenzar el test en Estadística'*/+
          'Recuerda que la fecha límite para responder al test es el <b>'+this._getFechaLocale(fecha_limite_revalida)+'</b>.\n'+
          this._getColetilla();

    }    
    this.getMensajeEmailRevalidaTXT= function(participante,fecha_limite_revalida,tests_revalida)
    {
    return this._eliminarFormato('Hola '+participante.getNombre()+',\n'+
          'Como parte del proceso de check-in de Programa '+this._programa.getNombre()+' te enviamos una serie de preguntas de comprobación de nivel básico adquirido en las capabilities especificadas durante la primera fase.\n'+
          'Recuerda que la fecha límite para responder al test es el '+this._getFechaLocale(fecha_limite_revalida)+'.\n')+
            tests_revalida.map(function(test_revalida){return '#Comenzar test en '+test_revalida.capability+': '+test_revalida.formulario.getPublishedUrl()+'\n'}).join('')+ // '#Comenzar el test en Estadística: link'+ 
          this._eliminarFormato(this._getColetilla());

    }
    this.getMensajeEmailRecordatorioRevalida= function(participante,fecha_limite_revalida,tests_revalida)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_revalida.getDate())?'hoy, ':'')+this._getFechaLocale(fecha_limite_revalida);

    return '<r>Hola '+participante.getNombre()+'</r>,\n'+
          'Como parte del proceso de check-in de <r>Programa '+this._programa.getNombre()+'</r> habrás recibido recientemente una invitación para completar test que permitirán verificar los conocimientos adquiridos en los MOOCs recomendados en la primera fase de este proceso.\n'+
          '<ul>'+tests_revalida.map(function(test_revalida){return '<li><a href="'+test_revalida.formulario.getPublishedUrl()+'">Comenzar test en '+test_revalida.capability+'</a></li>'}).join('')+'</ul>\n' /*'#Comenzar el test en Estadística'*/+
          'Recuerda que la fecha límite para responder al test es el <b>'+fecha+'</b>.\n'+
          this._getColetilla();    
    }

    this.getMensajeEmailRecordatorioRevalidaTXT= function(participante,fecha_limite_revalida,tests_revalida)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_revalida.getDate())?'hoy, ':'')+this._getFechaLocale(fecha_limite_revalida);

      return this._eliminarFormato('Hola '+participante.getNombre()+',\n'+
          'Como parte del proceso de check-in de Programa '+this._programa.getNombre()+' habrás recibido recientemente una invitación para completar test que permitirán verificar los conocimientos adquiridos en los MOOCs recomendados en la primera fase de este proceso.\n'+
          'Recuerda que la fecha límite para responder al test es el '+fecha+'.\n')+
            tests_revalida.map(function(test_revalida){return '#Comenzar test en '+test_revalida.capability+': '+test_revalida.formulario.getPublishedUrl()+'\n'}).join('')+ // '#Comenzar el test en Estadística: link'+ 
          this._eliminarFormato(this._getColetilla());    
    }
    this.getMensajeEmailConvocatoriaTXT=function(pdf_drive,formulario, fecha_limite_test)
    {
    return 'Hola.\n\nHa sido seleccionado para el Programa '+this._programa.getNombre()+' (más información aquí: '+pdf_drive.getUrl()+').\n'+
            'Debes completar este test de conocimiento para seguir con el proceso de candidatura:'+formulario.getPublishedUrl()+'.\n'+
            'Tienes de límite hasta el '+this._getFechaLocale(fecha_limite_test)+'.\n'+
              this._eliminarFormato(this._getColetilla()); 
    }

    this.getMensajeEmailCheckout= function(link_formulario)
    {
    return 'Hola,\n\nComo alumno del <r>Programa '+this._programa.getNombre()+'</r> debes responder al siguiente <a href="'+link_formulario+'">test de comprobación de conocimiento</a>.\n'+
          this._getColetilla(); 
    }
    this.getMensajeEmailCheckoutTXT= function(link_formulario){return this._eliminarFormato(this.getMensajeEmailCheckout(link_formulario));}

}



function MensajesEN ()
{
    this._programa = (new ThisSheet()).getPrograma();    
    this._getColetilla= function()    {        return '<b>Sieze</b> <r>the opportunity!</r>\n';    }
    this._eliminarFormato= function(text)    {        return text.replace(/<[^>]+>/g,'');    }
    this._getFechaLocale= function(fecha)    {        return dias_EN[fecha.getDay()]+' '+meses_EN[fecha.getMonth()]+' '+fecha.getDate()+'th';    }
    this.getAsuntoEmail= function()    {      return "BBVA Campus: "+this._programa.getNombre()+ " Program";    }
    
    this.getMensajeEmailRecordatorio= function(pdf_detalle,formulario,fecha_limite_test)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_test.getDate())?'today, ':'')+this._getFechaLocale(fecha_limite_test);

        return '<r>Hello</r>,\n'+
              'You received recently the invitation to participate in the check-in process of: <r>'+
              '<a href="'+pdf_detalle.getUrl()+'" target="_blank">'+this._programa.getNombre()+' Program</a></r>.\n'+
              'Remember that the deadline for completing the check-in test is <b>'+fecha+'</b>.\n'+
              '<a href="'+formulario.getPublishedUrl()+'">Start the test</a>\n'+
              this._getColetilla();
    
    }
    this.getMensajeEmailRecordatorioTXT= function(pdf_detalle,formulario,fecha_limite_test)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_test.getDate())?'today, ':'')+this._getFechaLocale(fecha_limite_test);
        return 'Hello.\n\nYou received recently the invitation to participate in the check-in process of: '+this._programa.getNombre()+' Program (more info here: '+pdf_detalle.getUrl()+').\n'+
                'Remember that the deadline for completing the check-in test is '+fecha+'.\n'+
                'Start the test:'+formulario.getPublishedUrl()+'\n'+
              this._eliminarFormato(this._getColetilla()); 
    }    
    this.getMensajeEmailResultadoApto= function(participante)
    {
    return  '<r>Hello '+participante.getNombre()+'</r>,\n'+
            'You have obtained <b>a good result</b> in the check-in test for the <r>'+this._programa.getNombre()+' Program</r>.\n'+
            'Congratulations! <b>You have the basic knowledge required to complete the course</b>.\n'+
            'In the next few weeks a tutor may contact you for a short interview (10 min) to meet you and verify the results of the test.\n'+
            this._getColetilla();
    }
    this.getMensajeEmailResultadoAptoTXT= function(participante){return this._eliminarFormato(this.getMensajeEmailResultadoApto(participante));}
    
    this.getMensajeEmailResultadoNoApto= function(participante,fecha_revalida)
    {
    return  '<r>Hello '+participante.getNombre()+'</r>,\n'+
            'You have obtained <b>a good result</b> in the check-in test for the '+this._programa.getNombre()+' Program.\n'+
            'You need to reinforce some knowledge with your express training plan.\n'+
            'Complete these courses (MOOCs) before <b>'+this._getFechaLocale(fecha_revalida)+'</b>:\n'+
              '<ul>'+participante.getPlanDeChoque().map(function(capability){return '<li><a href="'+capability.getLinkMOOC()+'">'+capability.getNombreMOOC()+'</a></li>'}).join('')+'</ul>'+ // '#Introduction to Statistics'+ 
            'You <b>will receive a new knowledge test afterwards</b>, checking if you reached the necessary level and thus be summoned to the program.\n'+
            'In the next few weeks a tutor may contact you for a short interview (10 min) to meet you and verify the results of the test.\n'+
            this._getColetilla();
    
    }
    this.getMensajeEmailResultadoNoAptoTXT= function(participante,fecha_revalida)
    {
    return  this._eliminarFormato('<r>Hello '+participante.getNombre()+'</r>,\n'+
            'You have obtained <b>a good result</b> in the check-in test for the '+this._programa.getNombre()+' Program.\n'+
            'You need to reinforce some knowledge with your express training plan.\n'+
            'Complete these courses (MOOCs) before <b>'+this._getFechaLocale(fecha_revalida)+'</b>:\n')+
            participante.getPlanDeChoque().map(function(capability){return '#'+capability.getNombreMOOC()+': '+capability.getLinkMOOC()+'\n'}).join('')+ // '#Introduction to Statistics: link'+ 
            'You <b>will receive a new knowledge test afterwards</b>, checking if you reached the necessary level and thus be summoned to the program.\n'+
            'In the next few weeks a tutor may contact you for a short interview (10 min) to meet you and verify the results of the test.\n'+
            this._eliminarFormato(this._getColetilla());
    
    }
    
    this.getMensajeEmailResultadoNoValido= function(participante)
    {
    return  '<r>Hello '+participante.getNombre()+'</r>,\n'+
            'Thank you for participating in the check-in for the <r>'+this._programa.getNombre()+' Program</r>.\n'+
            'Someone from the Data or Employee Experience department will contact you in the coming weeks to discuss the status of your application.\n'+
            this._getColetilla();

    }
    this.getMensajeEmailResultadoNoValidoTXT= function(participante){return this._eliminarFormato(this.getMensajeEmailResultadoNoValido(participante));}
    
    this.getMensajeEmailRevalida= function(participante,fecha_limite_revalida,tests_revalida)
    {
    return '<r>Hello '+participante.getNombre()+'</r>,\n'+
          'As part of the <r>'+this._programa.getNombre()+' Program</r> check-in process, we send you a series of basic level verification questions acquired in the capabilities specified during the first phase.\n'+
          '<ul>'+tests_revalida.map(function(test_revalida){return '<li><a href="'+test_revalida.formulario.getPublishedUrl()+'">Start the '+test_revalida.capability+' test</a></li>'}).join('')+'</ul>\n'+ //#Start the Statistics test
          'The deadline for completing this tests is <b>'+this._getFechaLocale(fecha_limite_revalida)+'</b>.\n'+
          this._getColetilla();

    }
    this.getMensajeEmailRevalidaTXT= function(participante,fecha_limite_revalida,tests_revalida)
    {
    
    return this._eliminarFormato('<r>Hello '+participante.getNombre()+'</r>,\n'+
          'As part of the <r>'+this._programa.getNombre()+' Program</r> check-in process, we send you a series of basic level verification questions acquired in the capabilities specified during the first phase.\n'+
          'The deadline for completing this tests is <b>'+this._getFechaLocale(fecha_limite_revalida)+'</b>.\n')+
            tests_revalida.map(function(test_revalida){return '#Start the '+test_revalida.capability+' test: '+test_revalida.formulario.getPublishedUrl()+'\n'}).join('')+ // #Start the Statistics test: link
          this._eliminarFormato(this._getColetilla());
    }
    
    this.getMensajeEmailRecordatorioRevalida= function(participante,fecha_limite_revalida,tests_revalida)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_revalida.getDate())?'today, ':'')+this._getFechaLocale(fecha_limite_revalida);
        return '<r>Hello '+participante.getNombre()+'</r>,\n'+
          'As part of the <r>'+this._programa.getNombre()+' Program</r> check-in process, you recently received an invitation to complete tests in order to verify acquired knowledge from the online courses recommended.\n'+
          '<ul>'+tests_revalida.map(function(test_revalida){return '<li><a href="'+test_revalida.formulario.getPublishedUrl()+'">Start the '+test_revalida.capability+' test</a></li>'}).join('')+'</ul>\n'+ //#Start the Statistics test
          'Remember that the deadline for completing this tests is <b>'+fecha+'</b>.\n'+
          this._getColetilla();
          
    }

    this.getMensajeEmailRecordatorioRevalidaTXT= function(participante,fecha_limite_revalida,tests_revalida)
    {
        var fecha = (((new Date()).getDate()==fecha_limite_revalida.getDate())?'today, ':'')+this._getFechaLocale(fecha_limite_revalida);
        
        return this._eliminarFormato('<r>Hello '+participante.getNombre()+'</r>,\n'+
          'As part of the <r>'+this._programa.getNombre()+' Program</r> check-in process, you recently received an invitation to complete tests in order to verify acquired knowledge from the online courses recommended.\n'+
          'Remember that the deadline for completing this tests is <b>'+fecha+'</b>.\n')+
            tests_revalida.map(function(test_revalida){return '#Start the '+test_revalida.capability+' test: '+test_revalida.formulario.getPublishedUrl()+'\n'}).join('')+ // #Start the Statistics test: link
          this._eliminarFormato(this._getColetilla());
    }    
    
    this.getMensajeEmailConvocatoriaTXT=function(pdf_drive,formulario, fecha_limite_test)
    {
    return 'Hello.\n\nYou have been selected for the '+this._programa.getNombre()+' Program (more info here: '+pdf_drive.getUrl()+').\n'+
            'You must take this knowledge test to be elegible for the program by '+this._getFechaLocale(fecha_limite_test)+':'+formulario.getPublishedUrl()+'.\n'+
              this._eliminarFormato(this._getColetilla()); 
    }
    
    this.getMensajeEmailCheckout= function(link_formulario)
    {
    return 'Hello.\n\nAs a student of the <r>'+this._programa.getNombre()+' Program</r> you must answer the following <a href="'+link_formulario+'">knowledge test</a>.\n'+
          this._getColetilla(); 
    }
    this.getMensajeEmailCheckoutTXT= function(link_formulario){return this._eliminarFormato(this.getMensajeEmailCheckout(link_formulario));}

}
 