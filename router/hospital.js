const express = require('express');
const router = express();

const { addHospitalDetails, getHospitalDetails, updateAppointment } = require('../controller/hospital');

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})

router.post('/addHospitalDetails', addHospitalDetails);

router.get('/hospital/:hospitalId', getHospitalDetails);

router.post('/updateAppointment', updateAppointment);

module.exports = router;