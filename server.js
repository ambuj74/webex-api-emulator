
const debug = require("debug")("emulator");
const express = require("express");
const uuid = require('uuid/v4');


//
// Setting up common services 
//
const app = express();

// Inject datastore
const datastore = require("./storage/memory");
app.locals.datastore = datastore;

app.set("x-powered-by", false); // to mimic Cisco Spark headers
app.set("etag", false); // to mimic Cisco Spark headers
// Middleware to mimic Cisco Spark HTTP headers
app.use(function (req, res, next) {
    res.setHeader("Cache-Control", "no-cache"); // to mimic Cisco Spark headers

    // New Trackingid
    res.locals.trackingId = "EM_" + uuid();
    res.setHeader("Trackingid", res.locals.trackingId);

    next();
});

// Middleware to enforce authentication
const authentication = require("./auth");
app.use(authentication.middleware);

// Load initial list of accounts
const accounts = Object.keys(authentication.tokens).map(function (item, index) {
    return authentication.tokens[item];
});
datastore.people.init(accounts);


//
// Loading services
//
const people = require("./resources/people");
app.use("/people", people);
const rooms = require("./resources/rooms");
app.use("/rooms", rooms);
const memberships = require("./resources/memberships");
app.use("/memberships", memberships);

//
// Starting server
//
const port = process.env.PORT || 3210;
app.locals.started = new Date(Date.now()).toISOString();
app.listen(port, function () {
    debug(`Emulator started on port: ${port}`);
    console.log(`Emulator started on port: ${port}`);
});
