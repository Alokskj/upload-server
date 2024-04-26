const express = require("express");
const cors = require("cors");
const uploadRouter = require("./routes/upload.routes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", uploadRouter);

app.listen(port, () => console.log(`Upload server is running on port ${port}`));
