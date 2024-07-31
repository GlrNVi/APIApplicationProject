let refreshToken;
let accessToken;
const codeVerifier = 'E6h5kekz8D4jSNPd2_GHFB6vHfdzHGz7weaOOhrepBw_PD9lg7BnN4NGs-sdpxdsktzAQoKGUt6200j6DW5zaImr1XjXLlO-skEyvZrnIkA1hXi6tTCDhw5bM-sV_6Er';
const codeChallange = 'S3Gxvv8uNzOdlQiBvShdcJf-7OeTUN7zCIrCa1GZOzA';
let clientID;
let installationID;
let gatewaySerial;
let deviceID;
let redirectURI;
let encodedURI;
let scope;
let autorisierungscode;
let currentURL


// First-Step of Authorization
function ersteSchrittAutorisierung() {
    clientID = document.getElementById('clientID').value;
    redirectURI = document.getElementById('redirectURI').value;
    encodedURI = encodeURIComponent(redirectURI);
    sessionStorage.setItem("clientID", clientID); // saving clientID in session storage for later use after login
    sessionStorage.setItem("encodedURI", encodedURI); // saving redirectURI in session storage for later use after login

    scope = 'IoT%20User%20offline_access';
    window.location.href = `https://iam.viessmann.com/idp/v3/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scope}&code_challenge=${codeCheallange}&code_challenge_method=S256`; // redirecting to Viessmann-Login-Page
    console.log('clientID: ' + clientID);
    console.log('redirectURI: ' + redirectURI);
    console.log('encodedURI1: ' + encodedURI);
}

// After being redirected to this page, press the second auhtorization button

// Second-Step of Authorization: loading data out of session storage; getting code out of URL; sending next request
async function zweiterSchrittAutorisierung() {
    clientID = sessionStorage.getItem("clientID"); // loading clientID from session storage
    encodedURI = sessionStorage.getItem("encodedURI"); // loading encodedURI from session storage
    console.log("storageclientid: " + clientID);
    console.log("storageEncodedURI2: " + encodedURI);
    //getting code out of URL, if no code in url, you can copy the code into the text field
    currentURL = window.location.href;
    console.log("current URL: " + currentURL);
    var index = currentURL.indexOf('=');
    if (index !== -1){
        autorisierungscode = currentURL.substring(index + 1);
    } else if (autorisierungscode === null) {
        autorisierungscode = document.getElementById('autorisierungsCode').value;
    }
    console.log("autorisierungscode: " + autorisierungscode);
    // sending request for the refresh token and access token
    try {
        const response = await fetch(`https://iam.viessmann.com/idp/v3/token?grant_type=authorization_code&client_id=${clientID}&redirect_uri=${encodedURI}&code_verifier=${codeVerifier}&code=${autorisierungscode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Überprüfen, ob die Antwort erfolgreich ist
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Die Antwort als JSON parsen
        const data = await response.json();

        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        document.getElementById('accessTokenDarstellung').value = accessToken;
        document.getElementById('refreshTokenDarstellung').value = refreshToken;
        console.log('accesstoken1: ' + accessToken);


    } catch (error) {
        // Fehlerbehandlung, falls die Anfrage fehlschlägt
        console.error('Fetch error:', error);
    }

    console.log('Access Token2: ' + accessToken);
    // authrozation finsished field
    if (document.getElementById('accessTokenDarstellung').value !== '' && document.getElementById('accessTokenDarstellung').value !== 'undefined'){
        document.getElementById('authorizationFinished').style.display = 'block';
        document.getElementById('buttonIDsEmpfangen').disabled = false;
    }

}


// Third-Step of Authorization: Receiving important IDs
async function dritterSchrittIDsEmpfangen() {
    try {
        const response = await fetch(`https://api.viessmann.com/iot/v1/equipment/installations?includeGateways=true`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        gatewaySerial = data.data[0].gateways[0].serial;
        installationID = data.data[0].id;
        deviceID = data.data[0].gateways[0].devices[0].id;
        document.getElementById('installationIDDarstellung').value = installationID;
        document.getElementById('deviceIDDarstellung').value = deviceID;
        document.getElementById('gatewaySerialDarstellung').value = gatewaySerial;

        // Do something with gatewaySerial, installationID, deviceID
    } catch (error) {
        console.error('Fetch error:', error);
    }
    document.getElementById('buttonDatenEmpfangen').disabled = false;
    console.log('installationID: ' + installationID);
    console.log('gatewaySerial: ' + gatewaySerial);
    console.log('deviceID: ' + deviceID);
}


// Fourth-Step of Authorization: Getting Data and starting timer
async function vierterSchrittDatenEmpfangen() {
    console.log('DatenEmpfangen wurde aufgerufen!!');
    try {
        const response = await fetch(`https://api.viessmann.com/iot/v2/features/installations/${installationID}/gateways/${gatewaySerial}/devices/${deviceID}/features`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        document.getElementById('boilerTempMainDarstellung').value = data.data[3].properties.value.value + '°C'; //heating boiler sonsors temperature main
        document.getElementById('boilerTempTargetDarstellung').value = data.data[5].properties.value.value + '°C'; //heating boiler temperature
        for (let i = 0; i < data.data.length; i++) {
            if (data.data[i].feature === 'heating.circuits.0.operating.modes.active') {
                document.getElementById('modeDarstellung').value = data.data[i].properties.value.value;
            }

        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
    timer();
    console.log('Daten empfangen!!');
}


// Function for changing operating mode Buttons; different Buttons passing different parameters into the function; calling fourth-step authorization function to update data and the timer is being resetted
async function setMode(neuerMode) {
    try {
        const response = await fetch(`https://api.viessmann.com/iot/v2/features/installations/${installationID}/gateways/${gatewaySerial}/devices/${deviceID}/features/heating.circuits.0.operating.modes.active/commands/setMode`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({mode: `${neuerMode}`})

        })

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.data.success === true){
            console.log('Daten sind erfolgreich gesendet')
            setTimeout(vierterSchrittDatenEmpfangen, 3000);
            console.log('habe gewartet');
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}


// Timer-Function
function timer() {
    startTime = Date.now();
    setInterval(function() {
        zeitVergangen = (Date.now() - startTime) / 1000;
        document.getElementById('timer').innerHTML = "Last update before: " + Math.floor(zeitVergangen/60) + " min " + (zeitVergangen%60).toFixed(1) + " sec"
    }, 100);
}