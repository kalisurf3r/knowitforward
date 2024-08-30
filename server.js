const sequelize = require("./config/connection");
const express = require("express");
const PORT = process.env.PORT || 3004;
const routes = require("./controllers");
const path = require("path");
const cors = require("cors");

const app = new express();
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(routes);

sequelize.sync({ force: false })
    .then(() => {
        app.listen(PORT, () => console.log(`App is listening on port: ${PORT}`));
    });
