

// Die Client-Id für die API-Anfragen
const client_Id = "e07eb862dbab65f1ab6c6fca07be16af"; 

// Das Refresh-Token für den Zugriff auf die API
const refresh_token = "e0e538c1dada173c27d305e11fd665c8"; 

// Initialisierung der Variablen
let access_token;
let installationid;
let gatewayid;
let deviceid;

// Funktion zur Abfrage der benötigten IDs
function ausgabeID() {
// Definieren der Header für die API-Anfrage
var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

// Konfiguration der Anfrage
var requestOptions = {
method: 'GET',
headers: myHeaders,
redirect: 'follow'
};

// Anfrage an den Authorization Server zur Generierung eines Access Tokens
fetch(`https://iam.viessmann.com/idp/v3/token?client_id=${client_Id}&grant_type=refresh_token&refresh_token=${refresh_token}`, requestOptions)
.then(response => response.json())
.then(data => {
access_token = data.access_token;

  // Anfrage an die IoT API zur Abfrage der benötigten IDs
  fetch(`https://api.viessmann.com/iot/v1/equipment/installations?includeGateways=true`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }) 
  .then(response => response.json())
  .then(data => {
    // Speichern der IDs
    gatewayid = data.data[0].gateways[0].serial;
    deviceid = data.data[0].gateways[0].devices[0].id;
    installationid = data.data[0].gateways[0].installationId;
    
    // Hinzufügen einer Erfolgsmeldung
    const systemOnline = document.createElement("div");
    systemOnline.textContent = "System online!";
    systemOnline.style.color = "green";
    systemOnline.style.fontWeight = "bold";
    document.getElementById("iddiv").appendChild(systemOnline);
    
    // Aktualisieren der HTML-Elemente mit den erhaltenen IDs
    document.getElementById("gw").value = gatewayid;
    document.getElementById("cid").value = client_Id;
    document.getElementById("dev").value = deviceid;
  }) 
})   
}

// Initialisierung der Variablen
let errorcode = "";
let errormsg = "";
let mode = "";
let program = "";
let dhwmode = "";
let temperaturesupply = "";
let unitsupply = "";
let dhwtemperature = "";
let dhwunit = "";
let outsidetemperature = "";
let outsideunit = "";
let temperaturereturn = "";
let unitreturn = "";
let comphours = "";
let unitcomp = "";
let compstarts = "";

// Diese Funktion erstellt eine CSV-Datei mit den übergebenen Parametern
function createCSV( mode, program, dhwmode, temperaturesupply, unitsupply, dhwtemperature, dhwunit, outsidetemperature, outsideunit, temperaturereturn, unitreturn, comphours, unitcomp, compstarts, errorcode, errormsg) {

  // Erstellen von Datums- und Uhrzeitangaben
  let currentTime = new Date();
  let currentDate = currentTime.getDate();
  let currentMonth = currentTime.getMonth();
  let currentHour = currentTime.getHours();
  let currentMinute = currentTime.getMinutes();

  // Erstellen der ersten CSV-Zeile mit den Spaltenüberschriften
  let row1 = "Date" + ";" + "Time" + ";" + "Operating Mode" + ";" + "Operating Programm" + ";" + "DHW Mode" + ";" + "Supplytemperatur" + ";" + "Unit Supply" + ";" + "DHW Temperatur" + ";" + "DHW Unit" + ";" + "Outsidetemperatur" + ";" + "Unit Outside" + ";" + "Returntemperatur" + ";" + "Return Unit" + ";" + "Compressor Hours" + ";" + "Unit Compressor" + ";" + "Compressor Starts" + "\n";
  // Erstellen der zweiten CSV-Zeile mit den übergebenen Parametern
  let row2 = currentDate + "." + currentMonth + ";" + currentHour + ":" + currentMinute + ";" + mode + ";" + program + ";" + dhwmode + ";" + temperaturesupply + ";" + unitsupply + ";" + dhwtemperature + ";" + dhwunit + ";" + outsidetemperature + ";" + outsideunit + ";" + temperaturereturn + ";" + unitreturn + ";" + comphours + ";" + unitcomp + "\n";

  // Zusammenfügen der CSV-Zeilen
  let csvData = row1 + row2;

  // Enkodieren der CSV-Daten in eine URI
  let encodedUri = encodeURI(csvData);

  // Erstellen eines Links zum Herunterladen der CSV-Datei
  let link = document.createElement("a");
  link.setAttribute("href", "data:text/csv;charset=utf-8," + encodedUri);
  link.setAttribute("download", "data.csv");

  // Hinzufügen des Links zum Dokument und Auslösen des Herunterladens der CSV-Datei
  document.body.appendChild(link);
  link.click();
  }
    
// Diese Funktion ruft verschiedene API-Endpunkte auf und gibt deren Werte aus
function ausgabeDB(){ 
   
  // Abfrage des Betriebsmodus des Heizkreises 0
   fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.circuits.0.operating.modes.active`,{
    headers: {
        Authorization: `Bearer ${access_token}`
      }
   }) 
    .then(response => response.json())
    .then(data => { 
    mode = data.data.properties.value.value;
    document.getElementById("mode").value = mode;

    // Falls eine Fehlermeldung zurückgegeben wird, wird sie angezeigt //Hier werden die API Fehler abgefangen
    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    }
    

  })
  //Hier werden die Code Fehler abgefangen
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });

//Die Logik der Abfrage wiederholt sich jedesmal //Nur die übergebene Parameter sind unterschiedlich

// Abfrage des aktiven Heizprogramms des Heizkreises 0
fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.circuits.0.operating.programs.active`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    program = data.data.properties.value.value;
    document.getElementById("program").value = program;

    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    }
    

  })
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });

  // Abfrage des Betriebsmodus des Warmwasserbereiters
  fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.dhw.operating.modes.active`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    //dhwmode = data.data.properties.value.value;
    document.getElementById("dhwmode").value = dhwmode;

    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    }
    

  })
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });
 
    //Abfrage der Vorlauftemperatur
    fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.circuits.0.sensors.temperature.supply`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })  
  .then(response => response.json())
  .then(data => { 
    temperaturesupply = data.data.properties.value.value;
    temperaturesupply = temperaturesupply.toString();
    temperaturesupply = temperaturesupply.replace(/\./,",");
    unitsupply = data.data.properties.value.unit;
    const unittemp = temperaturesupply + " Grad " + unitsupply;
    document.getElementById("temperaturesupply").value = unittemp;
  
    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    }
    

  })
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });

    //Abfrage der Temperatur des Warwassserbereiters
    fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.dhw.temperature.main`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })  
  
  .then(response => response.json())
  .then(data => { 
    dhwtemperature = data.data.properties.value.value;
    dhwtemperature = dhwtemperature.toString();
    dhwtemperature = dhwtemperature.replace(/\./,",");
    dhwunit = data.data.properties.value.unit;
    const unittemp = dhwtemperature + " Grad " + dhwunit;
    document.getElementById("dhwtemperature").value = unittemp;

    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    }
    
  })
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });

    //Abfrage der Außentemperatur
    fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.sensors.temperature.outside`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })  
  .then(response => response.json())
  .then(data => {
    outsidetemperature = data.data.properties.value.value;
    outsidetemperature = outsidetemperature.toString();
    outsidetemperature = outsidetemperature.replace(/\./,",");
    outsideunit = data.data.properties.value.unit;
    const unittemp = outsidetemperature + " Grad " + outsideunit;
    document.getElementById("temperatureoutside").value = unittemp;

    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    }
    
  })
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });

    //Abfrage der Rücklauftemperatur
    fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.primaryCircuit.sensors.temperature.return`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })  
  .then(response => response.json())
  .then(data => {
    temperaturereturn = data.data.properties.value.value;
    temperaturereturn = temperaturereturn.toString();
    temperaturereturn = temperaturereturn.replace(/\./,",");
    unitreturn = data.data.properties.value.unit;
    const unittemp = temperaturereturn + " Grad " + unitreturn;
    document.getElementById("temperaturereturn").value = unittemp; 

    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    }
    
  })
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });

    //Abfrage der Statisktiken des Kompressors
    fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/heating.compressors.0.statistics`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  })  
  .then(response => response.json())
  .then(data => {
    comphours = data.data.properties.hours.value;
    comphours = comphours.toString();
    comphours = comphours.replace(/\./,",");
    unitcomp = data.data.properties.hours.unit;
    compstarts = data.data.properties.starts.value;
    const comp = comphours + " " + unitcomp;
    const compstart = compstarts;
    document.getElementById("compressor").value = comp;
    document.getElementById("compressor2").value = compstart;
   
    if (data.message) {
      errormsg = data.message;
      errorcode = data.statusCode;
      document.getElementById("errorapi").innerText = " API Error: " + errorcode + " " + errormsg;
    } else {
      errormsg = "Kein Fehler in der API vorhanden!";
      errorcode = " ";
    } 

  })
  .catch(error => {
    console.error(error);
    document.getElementById("errorcode").innerText = "Code Error: " + error.message;

  });

}

//Diese Funktion ruft die Funktion zum Erstellen der CSV-Datei auf und speichert diese auf dem Gerät
function saveCSV(){

  createCSV(mode, program, dhwmode, temperaturesupply, unitsupply, dhwtemperature, dhwunit, outsidetemperature, outsideunit, temperaturereturn, unitreturn, comphours, unitcomp, compstarts);
  
}

// Diese Funktiion wird im Ausblick erwähnt und dient dazu alle Datenpunkte des Gerätes abzurufen und in einer Tabelle enzeigen zu lassen.
/*function ausgabeDF(){

    fetch(`https://api.viessmann.com/iot/v1/equipment/installations/${installationid}/gateways/${gatewayid}/devices/${deviceid}/features/`, {

    headers: {
        Authorization: `Bearer ${access_token}`
    }
        })  
    
    .then(response => response.json())
    .then(data => { 
        const devicefeatures = data.data; 
        let featureList = "";
        for(let i = 0; i < devicefeatures.length; i++) {
                const feature = devicefeatures[i].feature;
                const uri = devicefeatures[i].uri;
                featureList += '<tr><td>' + (i+1) + '</td><td>' + feature + '</td><td>' + uri + '</td></tr>';
        }
    document.getElementById("featurelist").innerHTML = featureList;
    const errormsg = data.message;
    const errorcode = data.statusCode;
    document.getElementById("error").value = "Error: " + errorcode + " " + errormsg;
     if (data.message) {
      errormsg = data.message;
    } else {
      errormsg = "Kein Fehler vorhanden";
      errorcode = " ";
    }
    errorcode = data.statusCode;
    document.getElementById("error").innerText = "Error: " + errorcode + " " + errormsg;
    })

      
} */ 




    


   




