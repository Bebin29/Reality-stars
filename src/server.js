console.log("Start des Servers");

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const morgan = require('morgan');
app.use(morgan('dev'));


app.get('/', (req, res) => {
  res.send('Hallo, Node.js!');
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
