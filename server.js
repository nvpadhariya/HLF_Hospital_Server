const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const { Gateway, Wallets } = require('fabric-network');

const path = require('path');
const fs = require('fs');

// const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'patientorg', 'connection-org1.json');
// const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
// const walletPath = path.join(process.cwd(), 'wallet/');

app.post('/addPatientDetails', async (req, res) => {
    try {
        const { patientId, firstName, lastName, email, userType, createdAt, city, address, state } = req.body;

        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'patientorg', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org1');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser4', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        await contract.submitTransaction('addPatientDetails', patientId, firstName, lastName, email, userType, createdAt, city, address, state);

        res.send(`Patient ${patientId} created successfully`);
    }
    catch (error) {
        console.error(`Failed to create Patient: ${error}`);
        res.status(500).send(error.message);
    }
})

app.post('/addHospitalDetails', async (req, res) => {
    try {
        let { hospitalId, name, email, userType, createdAt, type, doctor } = req.body;
        console.log(doctor, "<=doctor");
        doctor = JSON.stringify(doctor);
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'hospitalorg', 'connection-org2.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org2');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser5', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        let result = await contract.submitTransaction('addHospitalDetails', hospitalId, name, email, userType, createdAt, type, doctor);
        console.log(result.toString(), "result");
        res.send(`Hospital ${hospitalId} created successfully`);
    }
    catch (error) {
        console.error(`Failed to create Hospital: ${error}`);
        res.status(500).send(error.message);
    }
})

app.post('/addPharmacyDetails', async (req, res) => {
    try {
        const { pharmcyId, name, email, userType, createdAt, mobileNumber, city, state } = req.body;
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'pharmacyorg', 'connection-org3.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org3');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser6', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        await contract.submitTransaction('addPharmacyDetails', pharmcyId, name, email, userType, createdAt, mobileNumber, city, state);

        res.send(`Pharmacy ${pharmcyId} created successfully`);
    }
    catch (error) {
        console.error(`Failed to create Pharmacy: ${error}`);
        res.status(500).send(error.message);
    }
})

app.get('/patients/:patientId', async (req, res) => {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'patientorg', 'connection-org1.json');

        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org1');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser4', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        const result = await contract.evaluateTransaction('getPatientlByIdNew', req.params.patientId);
        console.log(result, "resultresult");
        const patinet = JSON.parse(result.toString());
        res.send(patinet);
    }
    catch (error) {
        console.error(`Failed to get patient: ${error}`);
        res.status(500).send(error.message);
    }
});

app.get('/hospital/:hospitalId', async (req, res) => {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'hospitalorg', 'connection-org2.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org2');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser5', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        const result = await contract.evaluateTransaction('getHospitalDetailsById', req.params.hospitalId);

        let hospital = JSON.parse(result.toString());
        hospital.Doctor = JSON.parse(hospital.Doctor)
        console.log(hospital.Doctor, "hospital<============");
        res.send(hospital);
    }
    catch (error) {
        console.error(`Failed to get hospital: ${error}`);
        res.status(500).send(error.message);
    }
});

app.get('/pharmacy/:pharmacyId', async (req, res) => {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'pharmacyorg', 'connection-org3.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org3');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser6', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        const result = await contract.evaluateTransaction('getPharmacyDetailsById', req.params.pharmacyId);
        const pharmacy = JSON.parse(result.toString());
        res.send(pharmacy);
    }
    catch (error) {
        console.error(`Failed to get pharmacy: ${error}`);
        res.status(500).send(error.message);
    }
})

app.post('/createAppointment', async (req, res) => {
    try {
        const appointmentId = Math.floor(Math.random() * 10000000);
        const patientId = req.body.patientId;
        const createDate = new Date()

        console.log(appointmentId, createDate, patientId, "patientId");

        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'patientorg', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org1');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser4', discovery: { enabled: true, asLocalhost: true } });

        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');
        console.log("before transaction ");
        const result = await contract.submitTransaction('createAppointment', appointmentId, patientId, createDate);
        let getAppointment = await contract.evaluateTransaction('getAppointmentDetailsById', appointmentId);
        getAppointment = JSON.parse(getAppointment.toString());
        res.json(getAppointment);
    }
    catch (error) {
        console.error(`Failed to create appointment: ${error}`);
        res.status(500).send(error.message);
    }
});

app.post('/updateAppointment', async (req, res) => {
    try {
        let appointmentData = req.body;
        appointmentData.updateDate = new Date();

        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'hospitalorg', 'connection-org2.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet/org2');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser5', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        console.log("------------------Before submit transaction-----------------------");
        console.log(appointmentData);

        let stringifyData = JSON.stringify(appointmentData);
        console.log(stringifyData);
        let result = await contract.submitTransaction('updateAppointment', stringifyData);
        console.log(result, "-----------result-------------");
        console.log("------------------After submit transaction------------------------");

        console.log(appointmentData.appointmentId);
        let getAppointment = await contract.evaluateTransaction('getAppointmentDetailsById', appointmentData.appointmentId);
        getAppointment = JSON.parse(getAppointment.toString());

        console.log(getAppointment, "------getAppointment------------");

        res.send({
            message: `Appointment ${appointmentData.appointmentId} updated successfully`,
            Appointment: getAppointment
        });
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


app.listen(3000, () => {
    console.log('Server started on port 3000');
});