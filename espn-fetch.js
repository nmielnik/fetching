var Promise = require("bluebird");
var request = require("request-promise");

var espnauth = require("./espn-auth");


var getTeamWeek = function(leagueId, year, teamId, week) {
	return new Promise(function (resolve, reject) {
		return espnauth.getAuthData()
			.then(function (authData) {
				var cookiejar = request.jar();
				var cookieStr = `espn_s2=${authData.s2}; Domain=fantasy.espn.com; hostOnly=?; aAge=?; cAge=3ms`;
				cookiejar.setCookie(cookieStr, 'https://fantasy.espn.com');
				var options = {
					uri: `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${leagueId}?forTeamId=${teamId}&scoringPeriodId=${week}&view=mRoster`,
					json: true,
					jar: cookiejar
				};
				return request(options)
					.then(function (data) {
						var playerList = 
						data.teams[0].roster.entries.map(function (entry) {
							var slot = {
								lineupSlotId: entry.lineupSlotId,
								onTeamId: entry.playerPoolEntry.onTeamId
							};
							var plyrInfo = entry.playerPoolEntry.player;
							slot.player = {
								id: plyrInfo.id,
								defaultPositionId: plyrInfo.defaultPositionId,
								firstName: plyrInfo.firstName,
								fullName: plyrInfo.fullName,
								lastName: plyrInfo.lastName,
								proTeamId: plyrInfo.proTeamId
							};
							slot.player.stats = plyrInfo.stats.find(function (stat) {
								return stat.statSourceId === 0 && stat.seasonId === year && stat.scoringPeriodId === week;
							});
							return slot;
						});
						resolve({
							teamId: teamId,
							leagueId: data.id,
							period: data.scoringPeriodId,
							seasonId: data.seasonId,
							roster: playerList
						});
					})
					.catch(reject);
			})
			.catch(reject);
	});
}

module.exports = {
	getTeamWeek: getTeamWeek
};

/* // For testing
getTeamWeek(403286, 2019, 1, 12)
	.then(function(data) {
		console.log(`teamId: ${data.teamId} players: ${data.roster.length}`);
	})
*/

// https://fantasy.espn.com/apis/v3/games/ffl/seasons/2019/segments/0/leagues/403286?forTeamId=1&scoringPeriodId=11&view=mRoster