const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const cricketPlayers = `
    SELECT * FROM cricket_team
    ORDER BY player_id`;
  const dbResponse = await db.all(cricketPlayers);
  response.send(
    dbResponse.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
app.post("/players/", async (request, response) => {
  const addDetails = request.body;
  const { playerName, jerseyNumber, role } = addDetails;
  const addPlayer = `INSERT INTO cricket_team(player_name,jersey_number,role) VALUES('${player_name}',${jersey_number},'${role}')`;
  const dbResponse = await db.run(addPlayer);
  response.send("Player Added to Team");
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const cricketPlayers = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId}`;
  const dbResponse = await db.get(cricketPlayers);
  response.send(dbResponse);
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateDetails = `UPDATE cricket_team SET player_id='${playerId}',${jersey_number},'${role}'
  WHERE player_id = ${playerId}`;
  const dbResponse = await db.run(updateDetails);
  response.send("Player Details Updated");
});
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const dbResponse = await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
