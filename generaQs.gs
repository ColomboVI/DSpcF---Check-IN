/*****

function onEdit(e){

var hojaActiva = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();

if(hojaActiva == 'Datos basicos'){
   var hojaDatosBasicos = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Datos basicos');
   var datos = hojaDatosBasicos.getRange(1, 1, 2, hojaDatosBasicos.getLastColumn()).getValues()[0];
   var fechaIniCheckIn = datos.indexOf('Fecha Inicio CheckIn') + 1;
   var qCheckIn = datos.indexOf('Q# CheckIn') + 1;            
   var fechaIniOut = datos.indexOf('Fecha inicio CheckOut')+ 1;
   var qOut = datos.indexOf('Q# CheckOut') + 1;
   var offCheckIn =  qCheckIn - fechaIniCheckIn;
   var offCheckOut =  qOut - fechaIniOut;
   var celdaActiva = hojaDatosBasicos.getActiveCell();
   var columnaActiva = celdaActiva.getColumn();
   var filaActiva = celdaActiva.getRow();
   
   if(columnaActiva == fechaIniCheckIn &&  filaActiva == 2){
   celdaActiva.offset( 0, offCheckIn).setValue(getFechaQCheckIN())    
        }
        
  if(columnaActiva == fechaIniOut &&  filaActiva == 2){
   celdaActiva.offset( 0, offCheckOut).setValue(getFechaQCheckOut())    
        }  
    }
}


function getFechaQCheckIN() {
  var cursoLista = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Datos basicos');
  var fecha = cursoLista.getRange('FECHA_INI').getValue();
  var fechaIni = new Date(fecha)
  var mes = fechaIni.getMonth();
  
      var quarterSiglas = {
        0   : "Q1",
        1   : "Q1",
        2   : "Q1",
        3   : "Q2",
        4   : "Q2",
        5   : "Q2",
        6   : "Q3",
        7   : "Q3",
        8   : "Q3",
        9   : "Q4",
        10  : "Q4",
        11  : "Q4"  
      } 
      
      for(var mesInQuarter in quarterSiglas){
         if(mes == mesInQuarter){
             Logger.log("Mes : " + quarterSiglas[mesInQuarter])
             return quarterSiglas[mesInQuarter]  
         }
     } 
}

function getFechaQCheckOut() {
  var cursoLista = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Datos basicos');
  var fecha = cursoLista.getRange('FECHA_OUT').getValue();
  var fechaIni = new Date(fecha)
  var mes = fechaIni.getMonth();
  
      var quarterSiglas = {
        0   : "Q1",
        1   : "Q1",
        2   : "Q1",
        3   : "Q2",
        4   : "Q2",
        5   : "Q2",
        6   : "Q3",
        7   : "Q3",
        8   : "Q3",
        9   : "Q4",
        10  : "Q4",
        11  : "Q4"  
      } 
      
      for(var mesInQuarter in quarterSiglas){
         if(mes == mesInQuarter){
             Logger.log("Mes : " + quarterSiglas[mesInQuarter])
             return quarterSiglas[mesInQuarter]  
         }
     } 
}


****/
