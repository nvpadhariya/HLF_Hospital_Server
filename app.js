/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../express/CAUtil.js');
const { buildCCPOrg1, buildCCPOrg2, buildCCPOrg3, buildWallet } = require('../express/AppUtil.js');

const channelName = 'health-channel';
const chaincodeName = 'Hospital';
const memberAssetCollectionName = 'assetPrivateCollection';
const org1PrivateCollectionName = 'PatientOrgMSPPrivateCollection';
const org2PrivateCollectionName = 'HospitalOrgMSPPrivateCollection';
const org3PrivateCollectionName = 'PharmacyOrgMSPPrivateCollection';
const mspOrg1 = 'PatientOrgMSP';
const mspOrg2 = 'HospitalOrgMSP';
const mspOrg3 = 'PharmacyOrgMSP';

const walletPath = path.join(__dirname, 'wallet');

const Org1UserId = 'appUser4';
const Org2UserId = 'appUser5';
const Org3UserId = 'appUser6';

async function initContractFromOrg1Identity() {
	// console.log('\n--> Fabric client user & Gateway init: Using Org1 identity to Org1 Peer');
	const ccpOrg1 = buildCCPOrg1();

	const caOrg1Client = buildCAClient(FabricCAServices, ccpOrg1, 'ca.org1');
	const walletPathOrg1 = path.join(__dirname, 'wallet/org1');
	const walletOrg1 = await buildWallet(Wallets, walletPathOrg1);

	await enrollAdmin(caOrg1Client, walletOrg1, mspOrg1);

	await registerAndEnrollUser(caOrg1Client, walletOrg1, mspOrg1, Org1UserId, 'org1.department1');

	try {
		const gatewayOrg1 = new Gateway();
		await gatewayOrg1.connect(ccpOrg1,
			{ wallet: walletOrg1, identity: Org1UserId, discovery: { enabled: true, asLocalhost: true } });

		return gatewayOrg1;
	} catch (error) {
		console.error(`Error in connecting to gateway: ${error}`);
	}
}

async function initContractFromOrg2Identity() {
	// console.log('\n--> Fabric client user & Gateway init: Using Org2 identity to Org2 Peer');
	const ccpOrg2 = buildCCPOrg2();
	const caOrg2Client = buildCAClient(FabricCAServices, ccpOrg2, 'ca.org2');

	const walletPathOrg2 = path.join(__dirname, 'wallet/org2');
	const walletOrg2 = await buildWallet(Wallets, walletPathOrg2);

	await enrollAdmin(caOrg2Client, walletOrg2, mspOrg2);
	await registerAndEnrollUser(caOrg2Client, walletOrg2, mspOrg2, Org2UserId, 'org2.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg2 = new Gateway();
		await gatewayOrg2.connect(ccpOrg2,
			{ wallet: walletOrg2, identity: Org2UserId, discovery: { enabled: true, asLocalhost: true } });

		return gatewayOrg2;
	} catch (error) {
		console.error(`Error in connecting to gateway: ${error}`);
	}
}

async function initContractFromOrg3Identity() {
	// console.log('\n--> Fabric client user & Gateway init: Using Org3 identity to Org3 Peer');
	const ccpOrg3 = buildCCPOrg3();
	const caOrg3Client = buildCAClient(FabricCAServices, ccpOrg3, 'ca.org3');
	const walletPathOrg3 = path.join(__dirname, 'wallet/org3');
	const walletOrg3 = await buildWallet(Wallets, walletPathOrg3);

	await enrollAdmin(caOrg3Client, walletOrg3, mspOrg3);
	await registerAndEnrollUser(caOrg3Client, walletOrg3, mspOrg3, Org3UserId, 'org3.department1');

	try {
		// Create a new gateway for connecting to Org's peer node.
		const gatewayOrg3 = new Gateway();
		await gatewayOrg3.connect(ccpOrg3,
			{ wallet: walletOrg3, identity: Org3UserId, discovery: { enabled: true, asLocalhost: true } });

		return gatewayOrg3;
	} catch (error) {
		console.error(`Error in connecting to gateway: ${error}`);
	}
}

async function main() {
	try {
		/** ******* Fabric client init: Using Org1 identity to Org1 Peer ********** */
		const gatewayOrg1 = await initContractFromOrg1Identity();
		const networkOrg1 = await gatewayOrg1.getNetwork(channelName);
		const contractOrg1 = networkOrg1.getContract(chaincodeName);
		contractOrg1.addDiscoveryInterest({ name: chaincodeName, collectionNames: [memberAssetCollectionName, org1PrivateCollectionName] });
		// console.log(networkOrg1, contractOrg1, "contractOrg1");
		/** ~~~~~~~ Fabric client init: Using Org2 identity to Org2 Peer ~~~~~~~ */
		const gatewayOrg2 = await initContractFromOrg2Identity();
		const networkOrg2 = await gatewayOrg2.getNetwork(channelName);
		const contractOrg2 = networkOrg2.getContract(chaincodeName);
		contractOrg2.addDiscoveryInterest({ name: chaincodeName, collectionNames: [memberAssetCollectionName, org2PrivateCollectionName] });

		/** ~~~~~~~ Fabric client init: Using Org3 identity to Org3 Peer ~~~~~~~ */
		const gatewayOrg3 = await initContractFromOrg3Identity();
		const networkOrg3 = await gatewayOrg3.getNetwork(channelName);
		const contractOrg3 = networkOrg3.getContract(chaincodeName);
		contractOrg3.addDiscoveryInterest({ name: chaincodeName, collectionNames: [memberAssetCollectionName, org3PrivateCollectionName] });
	}
	catch (error) {
		console.error(`Error in transaction: ${error}`);
		if (error.stack) {
			console.error(error.stack);
		}
	}
}

main();