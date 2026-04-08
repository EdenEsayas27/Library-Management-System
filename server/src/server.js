const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`Library backend running on port ${env.port}`);
});
