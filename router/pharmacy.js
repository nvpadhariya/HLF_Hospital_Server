const express = require('express');
const router = express();

const { addPharmacyDetails, getPharmacyDetails } = require('../controller/pharmacy');

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})

router.post('/addPharmacyDetails', addPharmacyDetails);

router.get('/pharmacy/:pharmacyId', getPharmacyDetails);

module.exports = router;