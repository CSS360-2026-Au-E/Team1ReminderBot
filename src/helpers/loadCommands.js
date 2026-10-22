import loadFiles from "./loadFiles";
import ascii from "ascii-table";
import path from "path";

export default function loadCommands(client, dirName) {
  client.commands.clear();

  const files = loadFiles(dirName, ".js");
  const table = new ascii("Commands").setHeading("Command", "Status");

  for (const file of files) {
    const command = require(path.join(dirName, file)).default;
    client.commands.set(command.data.name, command);
    table.addRow(file, "✅");
  }

  console.log(table.toString());
}
