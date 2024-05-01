//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const session = require('express-session');


const app = express();
const port = process.env.PORT || 3000;


async function run() {
    try {
        mongoose.set("strictQuery", true);

        mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // Send a ping to confirm a successful connection
        await mongoose.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        console.log(process.env.DB_URL)
        const db = mongoose.connection;
        db.on("error", (err) => console.log(err));
        db.once("open", () => console.log("CONNECT TO DB DONE !"))
            .then(() => {
                console.log('DB is connected');
            })
    } finally {
        // Ensures that the client will close when you finish/error
        await mongoose.close();
    }
}
run().catch(console.dir);



///* milddrewares *///

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});
app.use(express.static('uploads'));
///* set templete engine ejs
app.set("view engine", "ejs");

app.use("", require("./routes/routes"));

app.listen(port, () => { console.log(`CRUD app listening on port ${port}!`); });






// console.log(process.env);