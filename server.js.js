// Mengimpor modul cors
const cors = require("cors");
const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

let queueNumber = 0;

// Cek apakah file queueNumber.txt ada dan membaca nilainya jika ada
if (fs.existsSync("queueNumber.txt")) {
  queueNumber = parseInt(fs.readFileSync("queueNumber.txt", "utf8"));
}

// Menggunakan middleware CORS dengan konfigurasi untuk domain tertentu
const corsOptions = {
  origin: "https://lusivel.github.io", // Domain yang diizinkan
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get("/nextQueueNumber", (req, res) => {
  queueNumber++;
  fs.writeFileSync("queueNumber.txt", queueNumber.toString());
  res.json({ queueNumber });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
