/*************
 * Start an express server that creates sentiment based memes in Yoda dialect.
 * For example, the sentence "I am forlorn about Ted Cruz taking over." 
 * will: 
 1. be converted to the Yoda version "Forlorn about Ted Cruz taking over I am."
 2. be analyzed as having a "negative" sentiment
 3. since the sentiment is negative, the yoda version will be added to 
       a Darth Maul image to create a meme. (For "positive", Yoda is used)

 * Note that each step above is supplied by one of my 
 * [mashave web services](https://github.com/tzaffi/my-mashapes)
 *
 * USAGE: node index.js SERVER_PORT YODA_URL SENTIMENT_URL MEME_URL path/to/config.json
 * USAGE: node intermediator.js PORT path/to/config.json
 *
 * config-json should look like:
{
  "apiKeyName": "monkey-api-key",
  "apiKeyValue": "ZephaniahWasABullfrog",
} 
 *
 *************/

//var _ = require('lodash');
//var querystring = require('querystring');
var express = require('express');
var unirest = require('unirest');
var app = express();

/**
 * Process the request, pass along the relevant info to mashape,
 * and report back the results.
 * Different cases depending on whether config.multipleParams
 * is true or false.
 * if config.multipleParams:
 *    split the req.url using "/" as separator into parameters
 *    text process each of these 
 *    concatenate config.urlDefault + the above
 *    append ?param1=value1&param2=value2 with values taken from the above
 * else:
 *    just append ?theUrlParam=the text processed request url
function mashapeURL(req, config){
    var url;
    if(config.multipleParams){
	console.log("Considering multiple params");
	var params = req.url.split("/");
	params.splice(0,1); //get rid of first empty string since url starts with "/"
	//	console.log("Are these the guys????", params);
	params = _.map(params, _.flow(mashapeTexterize,decodeURI))
        //	console.log("How about these????", params);
	params = config.urlDefault.concat(params);
	//	console.log("READY NOW???", params);
	var zipped = _.zip(config.urlParams, params);
	var paramObj = {};
	_.map(zipped, function(x){ return paramObj[x[0]] = x[1] });
	console.log("paramObj:\n", paramObj);
	url = config.url + "?" + querystring.stringify(paramObj);
	//console.log("MUST BE NOW!!!!!!!!", url);
    } else {
	console.log("Only a single param");
	var preText = mashapeTexterize(decodeURI(req.url.substring(1)));
	console.log("preText: ", preText);
	url = config.url + "?" + config.urlParams + "=" + preText;
    }
    return url;
}
**/

function myMashapeURL(base, params){
    return [base].concat(params).join("/")
}

var usage = "USAGE: node index.js SERVER_PORT YODA_URL SENTIMENT_URL MEME_URL path/to/config.js"
console.log(usage);

var port = parseInt(process.argv[2]);
var yodaURL = process.argv[3];
var sentimentURL = process.argv[4];
var memeURL = process.argv[5];
var configPath = "./" + process.argv[6];
var config = require(configPath);

var yodaContentType = "text/plain";
var sentimentContentType = "application/json";
var memeContentType = "image/jpeg";

console.log("process.argv: ", process.argv);
console.log("Starting intermediator on port ", port);
console.log("Yoda API URL is: ", yodaURL);
console.log("Yoda content type is: ", yodaContentType);

console.log("Sentiment API URL is: ", sentimentURL);
console.log("Sentiment content type is: ", sentimentContentType);

console.log("Meme API URL is: ", memeURL);
console.log("Meme content type is: ", memeContentType);

console.log("Configuration ", configPath, " says:\n", config);


console.log("TESTING myMashapeURL() with ", yodaURL, " and ", ["Ted Cruz is annoyingly smart."]);
console.log( "yodaURL is: ", myMashapeURL(yodaURL,  ["Ted Cruz is annoyingly smart."]) );

console.log("TESTING myMashapeURL() with ", sentimentURL, " and ", ["Ted Cruz is annoyingly smart."]);
console.log( "sentimentURL is: ", myMashapeURL(sentimentURL,  ["Ted Cruz is annoyingly smart."]) );

console.log("TESTING myMashapeURL() with ", memeURL, " and ", ["Darth Maul", "Ted Cruz is", "annoyingly smart"]);
console.log( "memeURL is: ", myMashapeURL(memeURL, ["Darth Maul", "Ted Cruz is", "annoyingly smart"]) );

function myMashapeGet(req, res, url, contentType){
    unirest.get(url)
	.header(config.apiKeyName, config.apiKeyValue)
	.header("Accept", contentType)
	.end(function(result) {
		console.log("\nstatus:\n", result.status, 
			    "\nheaders:\n", result.headers, 
			    "\nbody:\n", ( result.headers["content-type"].substring(0, 5) == "image" 
					   ? "<IMAGE>"
					   : result.body
					   ) 
			    );
	    })
	.pipe(res);
}

//process.exit(0);

app.get('*', function (req, res) {
	var interestingBits = {
	    headers: req.headers,
	    originalUrl: req.originalUrl,
	    params: req.params,
	    query: req.query,
	    url: req.url
	};
	console.log("interesting bits\n", interestingBits);
	
	/*** WHILE DEBUGGING *** /
	mashapeURL(req, config)
	res.status(200).send("hello");
	/*** END WHILE DEBUGGING ***/

	/*
	var yodaFull = myMashapeURL(yodaURL, ["Ted Cruz is annoyingly smart."]);
	console.log("Querying the url:\n", yodaFull);
	myMashapeGet(req, res, yodaFull, yodaContentType);
	*/

	/*
	var sentimentFull =  myMashapeURL(sentimentURL,  ["Ted Cruz is annoyingly smart."]);
	console.log("Querying the url:\n", sentimentFull);
	myMashapeGet(req, res, sentimentFull, sentimentContentType);
	*/

	var memeFull = myMashapeURL(memeURL, ["Darth Maul", "Ted Cruz is", "annoyingly smart"]);
	console.log("Querying the url:\n", memeFull);
	myMashapeGet(req, res, memeFull, memeContentType);
    });

var server = app.listen(port, function () {
	console.log("STARTING UP");
	
	});
