var Promise = require("bluebird");
var request = require("request-promise");
var credentials = require("./local/credentials");


function addHeaders(body, response, resolveWithFullResponse) {
	return { headers: response.headers, body: body };
}

var getAPIKey = function () {
	var self = this;
	var options = {
		method: 'POST',
		uri: "https://registerdisney.go.com/jgc/v6/client/ESPN-ONESITE.WEB-PROD/api-key?langPref=en-US",
		body: "null",
		transform: addHeaders,
		headers: {
			'content-type': 'application/json'
		}
	};
	return new Promise(function (resolve, reject) {
		if (self.cachedKey) {
			return resolve(self.cachedKey);
		}
		request(options)
			.then(function (resp) {
				self.cachedKey = resp.headers['api-key'];
				//console.log(`new api key: ${resp.headers['api-key']}`);
				resolve(self.cachedKey);
			})
			.catch(function (err) {
				reject(err);
			});
	});
}

var getAuthData = function() {
	if (credentials.espn.S2) {
		this.cachedS2 = credentials.espn.S2;
	}
	if (credentials.espn.SWID) {
		this.cachedSWID = credentials.espn.SWID;
	}
	var self = this;
	return new Promise(function (resolve, reject) {
		if (self.cachedS2 && self.cachedSWID) {
			return resolve({
				s2: self.cachedS2,
				swid: self.cachedSWID
			});
		}
		self.getAPIKey()
			.then(function(apiKey) {
				var authOptions = {
					method: 'POST',
					uri: "https://registerdisney.go.com/jgc/v6/client/ESPN-ONESITE.WEB-PROD/guest/login?langPref=en-US",
					headers: {
						'authority': 'registerdisney.go.com',
						'content-type': 'application/json',
						'Authorization': `APIKEY ${apiKey}`,
						'g-recaptcha-token': ''
					},
					body: JSON.stringify(credentials.espn)
				};
				request(authOptions)
					.then(function (resp) {
						//console.log(JSON.stringify(resp));
						var json = JSON.parse(resp);
						self.cachedS2 = json.data.s2;
						self.cachedSWID = json.data.token.swid;
						//console.log(`new s2: ${self.cachedS2}`);
						//console.log(`new swid: ${self.cachedSWID}`);
						resolve({
							s2: self.cachedS2,
							swid: self.cachedSWID
						});
					})
					.catch(function (err) {
						reject(err);
					});
			})
			.catch(function (err) {
				reject(err);
			});
	});
}

module.exports = {
	getAuthData: getAuthData,
	getAPIKey: getAPIKey
}