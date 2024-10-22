const Handler = require('./../handler.js');
const { ClientSocket, SPacketPing, SPacketAnalytics } = require('./../../main.js');
const { translateText, LEVEL_TO_COLOUR } = require('./../../utils.js');
const SKINS = require('./../../types/skins.js');
let client, entities;

const self = class TabListHandler extends Handler {
	miniblox() {
		ClientSocket.on('CPacketPlayerList', packet => {
			let addList = [], removeList = [], exists = {};
			for (const entry of packet.players) {
				let nameSplit = entry.name.split(' ');
				if (entry.id == entities.local.id) nameSplit[nameSplit.length - 1] = client.username;
				const name = nameSplit[nameSplit.length - 1].slice(0, 16);
				const uuid = entry.id == entities.local.id ? client.uuid : entry.uuid;
				const skin = entities.skins[entry.id] != undefined ? (SKINS[entities.skins[entry.id]] ?? SKINS.granddad) : SKINS.granddad;
				const prefix = (nameSplit.length > 1 ? translateText(nameSplit.slice(0, nameSplit.length - 1).join(' ')) + ' ' : '').slice(0, 14) + translateText(`\\${(entry.color != 'white' ? entry.color : undefined) ?? (entry.id == entities.local.id ? 'white' : 'reset')}\\`);
				const suffix = (entry.level && entry.level > 0) ? translateText(`\\${entry.level ? LEVEL_TO_COLOUR[entry.level] : 'white'}\\ (${entry.level})`) : '';
				const gamemode = entities.gamemodes[entry.id] ?? 0;
				let oldTab = this.tabs[entry.id];
				this.entries[entry.id] = uuid;
				this.tabs[entry.id] = {
					entry: {
						UUID: uuid,
						name: name,
						properties: [{name: 'textures', value: skin[0], signature: skin[1]}],
						gamemode: gamemode,
						ping: entry.ping
					},
					checks: {
						prefix: prefix,
						suffix: suffix,
						ping: entry.ping,
						gamemode: gamemode
					}
				};
				exists[entry.id] = true;

				let addTeam;
				if (oldTab) {
					oldTab = oldTab.checks;
					if (prefix != oldTab.prefix || suffix != oldTab.suffix) {
						addTeam = true;
						client.write('scoreboard_team', {
							team: uuid.slice(0, 16),
							mode: 1
						});
					}

					if (gamemode != oldTab.gamemode) {
						console.log('gamemode changed');
						client.write('player_info', {
							action: 1,
							data: this.tabs[entry.id].entry
						});
					}

					if (entry.ping != oldTab.ping) {
						client.write('player_info', {
							action: 2,
							data: this.tabs[entry.id].entry
						});
					}
				} else {
					addList.push(this.tabs[entry.id].entry);
					addTeam = true;
				}

				if (addTeam) client.write('scoreboard_team', {
					team: uuid.slice(0, 16),
					mode: 0,
					name: uuid.slice(0, 32),
					prefix: prefix,
					suffix: suffix,
					friendlyFire: true,
					nameTagVisibility: 'all',
					color: 0,
					players: [name]
				});
			}

			for (const entry of Object.keys(this.entries)) {
				if (!exists[entry]) {
					removeList.push({UUID: this.entries[entry]});
					delete this.entries[entry];
					delete this.tabs[entry];
				}
			}

			if (addList.length > 0) {
				client.write('player_info', {
					action: 0,
					data: addList
				});
			}

			if (removeList.length > 0) {
				client.write('player_info', {
					action: 4,
					data: removeList
				});
			}

			client.write('playerlist_header', {
				header: JSON.stringify({text: translateText('\\cyan\\You are playing on \\lime\\miniblox.io')}),
				footer: JSON.stringify({text: translateText('\\gold\\Translation layer made by 7GrandDad')})
			});
			entities.checkAll();
		});
		ClientSocket.on("CPacketPong", packet => {
			this.filteredPing += (Math.max(Date.now() - Number(packet.time), 1) - this.filteredPing) / 3;
		});
	}
	minecraft(mcClient) {
		client = mcClient;
		client.on('keep_alive', packet => {
			if (packet.keepAliveId > 0) ClientSocket.sendPacket(new SPacketPing({time: BigInt(Date.now())}));
		});
	}
	cleanup(requeue) {
		client = requeue ? client : undefined;
		if (this.pingLoop) clearInterval(this.pingLoop);
		if (this.analyticsLoop) clearInterval(this.analyticsLoop);
		if (requeue) {
			this.pingLoop = setInterval(() => {
				client.write('keep_alive', {keepAliveId: Math.floor(Math.random() * 10000)});
			}, 1000);
			this.analyticsLoop = setInterval(() => {
				ClientSocket.sendPacket(new SPacketAnalytics({
					fps: 60 - Math.random(),
					ping: this.filteredPing
				}));
			}, 30000);
			if (client) {
				let data = [];
				Object.values(this.entries).forEach((uuid) => {
					data.push({UUID: uuid});
					client.write('scoreboard_team', {
						team: uuid.slice(0, 16),
						mode: 1
					});
				})
				client.write('player_info', {
					action: 4,
					data: data
				});
			}
		}
		this.entries = {};
		this.tabs = {};
		this.filteredPing = 0;
	}
	obtainHandlers(handlers) {
		entities = handlers.entity;
	}
};

module.exports = new self();