var argMap = require('minimist')(process.argv.slice(2));

var path = require("path");
var Promise = require("bluebird");
var fs =  Promise.promisifyAll(require("fs"));

var fetchTeamWeeks = require("./espn-fetch-teamweeks");

var leagueId = 403286;

var year = argMap.year || 2016;
if (!year || isNaN(year) || year < 2006 || year > new Date().getFullYear()) {
	console.error('year: ' + argMap.year + ' is invalid');
	return;
}

var week = argMap.week;
if (!week) {
	console.error('week: ' + argMap.week + ' is invalid');
	return;
}

if (!argMap.outputFile) {
	console.error('outputFile: ' + argMap.outputFile + ' is invalid');
	return;
}
var outputFile = path.join('//EINSTEIN/Projects/Dev/Visual Studio Projects/BallersDataUtil/OldBallersData/JSON', argMap.outputFile);

fetchTeamWeeks.getTeamWeeksJSON(leagueId, year, week, 1, 12)
	.then(function (result) {
		fs.writeFileAsync(outputFile, JSON.stringify(result))
			.then(function () {
				console.log(`Saved to ${outputFile}`);
			})
			.catch(function (err) {
				console.error(err);
			});
	})
	.catch(function (err) {
		console.error(err);
	});