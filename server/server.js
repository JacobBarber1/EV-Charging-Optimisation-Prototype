import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 9877;

// Root url
app.get("/", (req, res) => {
  res.send("Server is live").status(200);
});

// Server listening on defined port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});