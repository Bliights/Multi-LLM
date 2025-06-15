require('dotenv').config();

const SERV = process.env.BACKEND_SERV;
const PORT = process.env.BACKEND_PORT;

module.exports = {
  "/api": {
    "target": `http://${SERV}:${PORT}`,
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}



