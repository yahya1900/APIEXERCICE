import jsonServer from "json-server";
import { fileURLToPath } from "node:url";

const server = jsonServer.create();
const router = jsonServer.router(fileURLToPath(new URL("./db.json", import.meta.url)));

server.use(jsonServer.defaults());
server.use(router);

const port = Number(process.env.PORT) || 3001;
server.listen(port, "0.0.0.0", () => {
  console.log(`JSON Server running on port ${port}`);
});
