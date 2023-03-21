const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectId;

const app = express();
const jsonParser = express.json();

// Connection URL
const url = 'mongodb://localhost:27017';
const clinic = new MongoClient(url);

let dbClinic;

app.use(express.static(__dirname + "/public"));

async function connect() {
    
    await clinic.connect();

    dbClinic = clinic;

    app.locals.collection = clinic.db("clinicsdb").collection("clinics");
    app.listen(3000, function () {
        console.log("Підключення до серверу...");
    });
}

app.get("/api/clinics", async function (req, res) {
    const collection = req.app.locals.collection;
    let clinics = await collection.find({}).toArray();
    res.send(clinics);
});

app.get("/api/clinics/:id", async function (req, res) {

    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    let clinic = await collection.findOne({ _id: id });
    res.send(clinic);
});

app.post("/api/clinics", jsonParser, async function (req, res) {

    if (!req.body) return res.sendStatus(400);

    const clinicName = req.body.name;
    const clinicRating = req.body.rating;
    const clinicType = req.body.type;
    const clinic= { name: clinicName, rating: clinicRating, type: clinicType };

    const collection = req.app.locals.collection;
    let inserted = await collection.insertOne(clinic);
    let insertedClinic = await collection.findOne({_id: inserted.insertedId});
    res.send(insertedClinic);
});

app.delete("/api/clinics/:id", async function (req, res) {

    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    const deletedClinic = await collection.findOneAndDelete({ _id: id });
    res.send(deletedClinic.value);
});

app.put("/api/clinics", jsonParser, async function (req, res) {

    if (!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const clinicName = req.body.name;
    const clinicRating = req.body.rating;
    const clinicType = req.body.type;

    const collection = req.app.locals.collection;
    const updatedClinic = await collection.findOneAndUpdate({ _id: id }, { $set: {  name: clinicName, rating: clinicRating, type: clinicType }}, { returnDocument: "after"});
    res.send(updatedClinic.value); 
});


process.on("SIGINT", () => {
    dbClinic.close();
    process.exit();
});

connect().catch(console.error);