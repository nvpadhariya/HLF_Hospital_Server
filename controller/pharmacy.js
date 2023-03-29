const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const mspOrg3 = 'PharmacyOrgMSP';
const FabricCAServices = require('fabric-ca-client');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildCCPOrg3, buildWallet } = require('../AppUtil.js');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'test-network-3org-new', 'organizations', 'peerOrganizations', 'pharmacyorg', 'connection-org3.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = path.join(process.cwd(), 'wallet/org3');

const addPharmacyDetails = async (req, res) => {
    try {
        let pharmacyDetails = req.body;
        console.log(pharmacyDetails);
        let parsePharmacyDetails = JSON.stringify(pharmacyDetails);

        const ccpOrg3 = buildCCPOrg3();
        const caOrg3Client = buildCAClient(FabricCAServices, ccpOrg3, 'ca.org3');
        const walletPathOrg3 = path.join(__dirname, '..', 'wallet/org3');
        const walletOrg3 = await buildWallet(Wallets, walletPathOrg3);
        await registerAndEnrollUser(caOrg3Client, walletOrg3, mspOrg3, pharmacyDetails.pharmacyId, 'org3.department1');

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: pharmacyDetails.pharmacyId, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        await contract.submitTransaction('addPharmacyDetails', parsePharmacyDetails);

        res.send(`Pharmacy ${pharmacyDetails.pharmacyId} created successfully`);
    }
    catch (error) {
        console.error(`Failed to create Pharmacy: ${error}`);
        res.status(500).send(error.message);
    }
}

const getPharmacyDetails = async (req, res) => {
    try {
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: req.params.pharmacyId, discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('health-channel');
        const contract = network.getContract('Hospital');

        const result = await contract.evaluateTransaction('getPharmacyDetailsById', req.params.pharmacyId);
        let pharmacy = JSON.parse(result.toString());
        console.log(pharmacy);

        res.send(pharmacy);
    }
    catch (error) {
        console.error(`Failed to get pharmacy: ${error}`);
        res.status(500).send(error.message);
    }
}

module.exports = { addPharmacyDetails, getPharmacyDetails }