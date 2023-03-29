const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const mspOrg1 = 'PatientOrgMSP';
const FabricCAServices = require('fabric-ca-client');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildCCPOrg3, buildWallet } = require('../AppUtil.js');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'patientorg', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = path.join(process.cwd(), 'wallet/org1');

const addPatientDetails = async (req, res) => {
    try {
        let patientDetails = req.body;
        console.log(patientDetails);
        let parsePatientDetails = JSON.stringify(patientDetails)

        const ccpOrg1 = buildCCPOrg1();
        const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca.org1');
        const walletPathOrg1 = path.join(__dirname, '..', 'wallet/org1');
        const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);
        await registerAndEnrollUser(caOrg1Client, walletOrg1, mspOrg1, patientDetails.patientId, 'org1.department1');;

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: patientDetails.patientId, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        await contract.submitTransaction('addPatientDetails', parsePatientDetails);

        res.send(`Patient ${patientDetails.patientId} created successfully`);
    }
    catch (error) {
        console.error(`Failed to create Patient: ${error}`);
        res.status(500).send(error.message);
    }
}

const getPatientDetails = async (req, res) => {
    try {
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: req.params.patientId, discovery: { enabled: true, asLocalhost: true } });
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
}

const createAppointment = async (req, res) => {
    try {
        let createAppointmentDetails = req.body;
        console.log(createAppointmentDetails.patientId, "----------------");
        createAppointmentDetails.status = ["APT-CREATED"]
        createAppointmentDetails.appointmentId = (Math.floor(Math.random() * 10000000)).toString();
        createAppointmentDetails.patientId = createAppointmentDetails.patientId;
        createAppointmentDetails.createDate = new Date()
        createAppointmentDetails.updateDate = createAppointmentDetails.createDate

        let parseCreateAppointmentDetails = JSON.stringify(createAppointmentDetails);
        console.log(parseCreateAppointmentDetails, "----------");

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: req.body.patientId, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        const result = await contract.submitTransaction('createAppointment', parseCreateAppointmentDetails);
        let getAppointment = await contract.evaluateTransaction('getAppointmentDetailsById', createAppointmentDetails.appointmentId);
        getAppointment = JSON.parse(getAppointment.toString());

        res.json(getAppointment);
    }
    catch (error) {
        console.error(`Failed to create appointment: ${error}`);
        res.status(500).send(error.message);
    }
}

module.exports = { addPatientDetails, getPatientDetails, createAppointment };