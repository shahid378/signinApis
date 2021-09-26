const express = require('express');
const userRoutes = require('./src/routers/userRoutes.js')


const port = 3001;
const app = express();

app.use(express.json());
app.use(userRoutes);

app.listen(port, () => {
    console.log('server started')
})