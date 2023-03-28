const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.use("/", require("./router/hospital"));
app.use("/", require("./router/patient"));
app.use("/", require("./router/pharmacy"));

app.listen(3000, () => {
    console.log('Server started on port 3000');
});