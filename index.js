require('dotenv').config() // Load .env file
const axios = require('axios')
const Discord = require('discord.js')
const clientMC = new Discord.Client()
const clientRUST = new Discord.Client()

function pingForPlayersMC() {
	// Ping  minecraft API for server data.
	axios.get(`https://api.mcsrvstat.us/2/${process.env.MC_SERVER_IP}`).then(res => {
		// If we got a valid response
		if(res.data && res.data.players) {
			let playerCount = res.data.players.online || 0 // Default to zero
			clientMC.user.setPresence({
				game: {
					// Example: "Watching 5 players on server.com"
					name: `${playerCount} player${playerCount !=1 ? 's' : ''} on ${process.env.MCSERVERNAME}`,
					type: 3 // Use activity type 3 which is "Watching"
				}
			})
			console.log('Updated Minecraft player count to', playerCount)
		}
		else
			console.log('Could not load player count data for minecraft server with ip ', process.env.MC_SERVER)
	
	}).catch(err => console.log('Error pinging api.mcsrvstat.us for data:', err))
  
}

function pingForPlayersRust() {
  
  // Ping rust api
  axios.get(`https://api.rust-servers.info/status/${process.env.RUST_SERVER_ID}`).then(res => {
		// If we got a valid response
		if(res.data && res.data.players) {
			let playerCount = res.data.players || 0 // Default to zero
			clientRUST.user.setPresence({
				game: {
					// Example: "Watching 5 players on server.com"
					name: `${playerCount} player${playerCount !=1 ? 's' : ''} on ${process.env.RUSTSERVERNAME}`,
					type: 3 // Use activity type 3 which is "Watching"
				}
			})
			console.log('Updated Rust player count to', playerCount)
		}
		else
			console.log('Could not load player count data for rust server with id ', process.env.RUST_SERVER_ID)
	
	}).catch(err => console.log('Error pinging api.rust-servers.info for data:', err))
  
}

// Runs when client connects to Discord.
clientMC.on('ready', () => {
	console.log('Logged in as', clientMC.user.tag)

	pingForPlayersMC() // Ping server once on startup
	// Ping the server and set the new status message every x seconds. (Minimum of 1 second)
	setInterval(pingForPlayersMC, Math.max(1, process.env.PING_FREQUENCY || 1) * 1000)
})

// Login to Discord
if(process.env.MC_SERVER_IP) clientMC.login(process.env.DISCORD_TOKEN_MC)

// Runs when client connects to Discord.
clientRUST.on('ready', () => {
	console.log('Logged in as', clientRUST.user.tag)

	pingForPlayersRust() // Ping server once on startup
	// Ping the server and set the new status message every x seconds. (Minimum of 1 second)
	setInterval(pingForPlayersRust, Math.max(1, process.env.PING_FREQUENCY || 1) * 1000)
})

// Login to Discord
if(process.env.RUST_SERVER_ID) clientRUST.login(process.env.DISCORD_TOKEN_RUST)

// Webserver so that heroku doesn't close
const http = require('http');
const port = process.env.PORT||5000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Eddland ready for duty!');
});

server.listen(port, () => {
  console.log(`Server running`);
});

function keepAlive() {
	 console.log('Gonna keep alive!');
	 axios.get(process.env.MYURL).then(res => {
		 console.log('Kept alive!');
	}).catch(err => console.log('Error keeping alive...', err))
}

// Timer to keep heroku bot alive that runs every 20 minutes
if(process.env.MYURL) {
	setTimeout(keepAlive, 3000);
	setInterval(keepAlive, 20 * 60 * 1000);
}
