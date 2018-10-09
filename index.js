const express = require('express');
const bodyParser = require('body-parser');
const indexRouter = require('./routes/index');
const groupsRouter = require('./routes/groups');

const app = express();

// Set view engine to ejs
app.set('view engine', 'ejs');

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configure routes
app.use('/', indexRouter);
app.use('/groups', groupsRouter);
app.use('*', (req, res) => res.redirect('/')); // invalid route

const port = Number(process.env.PORT || 5000);
app.listen(port);
