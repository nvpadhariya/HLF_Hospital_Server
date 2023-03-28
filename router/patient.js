const express = require('express');
const router = express();

const { addPatientDetails, getPatientDetails, createAppointment } = require('../controller/patient');

router.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})

router.post('/addPatientDetails', addPatientDetails);

router.get('/patients/:patientId', getPatientDetails);

router.post('/createAppointment', createAppointment);

module.exports = router;