const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const mspOrg2 = 'HospitalOrgMSP';
const FabricCAServices = require('fabric-ca-client');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildCCPOrg3, buildWallet } = require('../AppUtil.js');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'hospitalorg', 'connection-org2.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = path.join(process.cwd(), 'wallet/org2');
// const wallet = Wallets.newFileSystemWallet(walletPath);

const addHospitalDetails = async (req, res) => {
    try {
        let addHospitalDetails = req.body;
        let parseaddHospitalDetails = JSON.stringify(addHospitalDetails);

        const ccpOrg2 = buildCCPOrg2();
        const caOrg2Client = buildCAClient(FabricCAServices, ccpOrg2, 'ca.org2');
        const walletPathOrg2 = path.join(__dirname, '..', 'wallet/org2');
        const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);
        await registerAndEnrollUser(caOrg2Client, walletOrg2, mspOrg2, addHospitalDetails.hospitalId, 'org2.department1');

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: addHospitalDetails.hospitalId, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        let result = await contract.submitTransaction('addHospitalDetails', parseaddHospitalDetails);
        console.log(result.toString(), "result");

        res.send(`Hospital ${addHospitalDetails.hospitalId} created successfully`);
    }
    catch (error) {
        console.error(`Failed to create Hospital: ${error}`);
        res.status(500).send(error.message);
    }
}

const getHospitalDetails = async (req, res) => {
    try {
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: req.params.hospitalId, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        const result = await contract.evaluateTransaction('getHospitalDetailsById', req.params.hospitalId);
        let hospital = JSON.parse(result.toString());

        res.send(hospital);
    }
    catch (error) {
        console.error(`Failed to get hospital: ${error}`);
        res.status(500).send(error.message);
    }
}

const updateAppointment = async (req, res) => {
    try {
        let appointmentData = req.body;
        appointmentData.updateDate = new Date();

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: req.body.details.hospitalID, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        console.log("------------------Before submit transaction-----------------------");
        console.log(appointmentData);
        appointmentData.removeFields = ["status", "appointmentId", "removeFields"]
        let stringifyData = JSON.stringify(appointmentData);
        console.log(stringifyData, "--stringifyData");

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
}

module.exports = { addHospitalDetails, getHospitalDetails, updateAppointment }