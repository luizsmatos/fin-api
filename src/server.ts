import { app } from "./app";
import createConnection from "./database";

createConnection();

app.listen(3333, () => {
  console.log("Server is running");
});
