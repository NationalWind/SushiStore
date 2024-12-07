import express from "express"

const app = express();

app.get("/", (req, res) => {
    let x = 0;
    res.send(`<h1> ${x} </h1>`);
})

app.listen(3000, () => {
    console.log("Sus");
})