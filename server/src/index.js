const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const port = process.env.PORT || 4000;

const main = async () => {
  try {
    server.listen(port, async () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (err) {
    console.error("Error while listenting to the server");
  }
};

main();
