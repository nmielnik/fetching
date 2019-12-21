var Promise = require("bluebird");
var espnfetch = require('./espn-fetch');

var getTeamWeeksJSON = function(leagueId, year, week, teamIds)
{
	var promises = teamIds.map(function (teamId) {
		return espnfetch.getTeamWeek(leagueId, year, teamId, week);
	});
	return new Promise(function (resolve, reject) {
		if (!promises || !promises.length)
			return resolve({});

		Promise.all(promises)
			.spread(function () {
				var result = {
					leagueId: leagueId,
					seasonId: year,
					period: week
				};
				result.rosters = Array.prototype.slice.apply(arguments).map(function (team) {
					return team;
				});
				resolve(result);
			})
			.catch(reject);
	});
}

module.exports = {
	getTeamWeeksJSON: getTeamWeeksJSON
};