// Hardcoded user credentials
const validUser = {
    username: "admin",
    password: "password123"
};

// Login Function
function login() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    if (username === validUser.username && password === validUser.password) {
        alert("Login successful!");
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('recordsContainer').style.display = 'block';
        displayRecords();
    } else {
        alert("Invalid username or password.");
    }
}

// Logout Function
function logout() {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('recordsContainer').style.display = 'none';
}

// Save Record Function
function saveRecord() {
    let name = document.getElementById('patientName').value.trim();
    let history = document.getElementById('medicalHistory').value.trim();
    let prescriptionFile = document.getElementById('prescriptionFile').files[0];
    let timestamp = new Date().toLocaleString();

    if (!name || !history) {
        alert('Please enter patient name and medical history.');
        return;
    }

    let records = JSON.parse(localStorage.getItem('mediVaultRecords')) || [];
    let existingRecord = records.find(record => record.name.toLowerCase() === name.toLowerCase());

    if (prescriptionFile) {
        let reader = new FileReader();
        reader.onload = function (event) {
            let prescriptionData = event.target.result;
            saveToLocalStorage(name, history, prescriptionData, timestamp, existingRecord, records);
        };
        reader.readAsDataURL(prescriptionFile);
    } else {
        saveToLocalStorage(name, history, "", timestamp, existingRecord, records);
    }
}

// Save to Local Storage
function saveToLocalStorage(name, history, prescriptionData, timestamp, existingRecord, records) {
    if (existingRecord) {
        existingRecord.history += ", " + history;
        existingRecord.timestamp = timestamp;
        if (prescriptionData) existingRecord.prescription = prescriptionData;
    } else {
        records.push({ name, history, prescription: prescriptionData, timestamp });
    }

    localStorage.setItem('mediVaultRecords', JSON.stringify(records));
    displayRecords();

    document.getElementById('patientName').value = "";
    document.getElementById('medicalHistory').value = "";
    document.getElementById('prescriptionFile').value = "";
}

// Display Records
function displayRecords() {
    let recordsList = document.getElementById('recordsList');
    recordsList.innerHTML = '';
    let records = JSON.parse(localStorage.getItem('mediVaultRecords')) || [];

    records.forEach((record, index) => {
        let recordElement = document.createElement('div');
        recordElement.className = 'record';
        recordElement.innerHTML = `
            <strong>${record.name}</strong><br>
            ${record.history}<br>
            <small>Saved on: ${record.timestamp}</small><br>
            {record.prescription ? <img src="${record.prescription}" width="150" alt="Prescription Image"> </img>
            <br> : 'No Prescription Uploaded'}<br>
            <button onclick='deleteRecord(${index})'>Delete</button>
            {record.prescription ? <button onclick='extractText("${record.prescription}", ${index})'>Extract Prescription</button><br> : ''}
            <div id="extractedText-${index}" class="extracted-text"></div>
        `;
        recordsList.appendChild(recordElement);
    });
}

// Extract Text from Prescription (Tesseract OCR)
async function extractText(imageData, index) {
    const worker = Tesseract.createWorker({
        logger: m => console.log(m) // Log progress
    });

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data: { text } } = await worker.recognize(imageData);
    document.getElementById(extractedText-{index}).innerHTML = <><strong>Extracted Text:</strong><p>text</p></>;

    await worker.terminate();
}

// Delete Record
function deleteRecord(index) {
    let records = JSON.parse(localStorage.getItem('mediVaultRecords')) || [];
    records.splice(index, 1);
    localStorage.setItem('mediVaultRecords', JSON.stringify(records));
    displayRecords();
}

// Search Records
function searchRecords() {
    let query = document.getElementById('search').value.toLowerCase();
    let records = JSON.parse(localStorage.getItem('mediVaultRecords')) || [];
    let filteredRecords = records.filter(record => record.name.toLowerCase().includes(query));

    document.getElementById('recordsList').innerHTML = '';
    filteredRecords.forEach((record, index) => {
        let recordElement = document.createElement('div');
        recordElement.className = 'record';
        recordElement.innerHTML = `
            <strong>${record.name}</strong><br>
            ${record.history}<br>
            <small>Saved on: ${record.timestamp}</small><br>
            {record.prescription ? <img src="${record.prescription}" width="150" alt="Prescription Image"><br> : 'No Prescription Uploaded'}<br>
            <button onclick='deleteRecord(${index})'>Delete</button>
            {record.prescription ? <button onclick='extractText("${record.prescription}", ${index})'>Extract Prescription</button><br> : ''}
            <div id="extractedText-${index}" class="extracted-text"></div>
        `;
        document.getElementById('recordsList').appendChild(recordElement);
    });
}

// Load Records on Page Load
displayRecords();