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

var express = require('express');
var unirest = require('unirest');
var app = express();


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

var test = false;
if(test){
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
}

function myMashapeGet(req, res, url, contentType, endFunc){
    return unirest.get(url)
	.header(config.apiKeyName, config.apiKeyValue)
	.header("Accept", contentType)
	.end(endFunc);
}

//process.exit(0);
function responseLogger(result) {
    console.log("\nstatus:\n", result.status, 
		"\nheaders:\n", result.headers, 
		"\nbody:\n", ( result.headers["content-type"].substring(0, 5) == "image" 
			       ? "<IMAGE>"
			       : result.body
			       ) 
		);
}

app.get('*', function (req, res) {
	var interestingBits = {
	    headers: req.headers,
	    originalUrl: req.originalUrl,
	    params: req.params,
	    query: req.query,
	    url: req.url
	};
	console.log("interesting bits\n", interestingBits);
	
	var sentence = req.url.substring(1);
	console.log('Sending forth "', sentence, '"');
	var urlOne = "https://poker.p.mashape.com/index.php?players=4";

	var sentimentFullURL =  myMashapeURL(sentimentURL,  [sentence]);
	var yodaFullURL = myMashapeURL(yodaURL, [sentence]);

	console.log("Querying the url:\n", sentimentFullURL);
	unirest.get(sentimentFullURL)
	    .header(config.apiKeyName, config.apiKeyValue)
	    .header("Accept", sentimentContentType)
	    .end(function(sentimentResponse){
		    responseLogger(sentimentResponse);
		    var sentimentScore = sentimentResponse.body["sentiment-score"];
		    console.log("sentimentScore: ", sentimentScore);

		    console.log("Querying the url:\n", yodaFullURL);
		    unirest.get(yodaFullURL)
			.header(config.apiKeyName, config.apiKeyValue)
			.header("Accept", yodaContentType)
			.end(function(yodaResponse){
				responseLogger(yodaResponse);
				var yodaSentence = yodaResponse.body;
				//remove extra spaces:
				yodaSentence = yodaSentence.replace(/ +(?= )/g,'');
				console.log("yodaSentence: ", yodaSentence);
				var memeImage = (sentimentScore > 0 ? "Advice Yoda" : "Darth Maul");
				var yodaWords2 = yodaSentence.split(" ");
				var yodaWords1 = yodaWords2.splice(0, yodaWords2.length/2);
				var memeArray = [memeImage, yodaWords1.join(' '), yodaWords2.join(' ')];
				var memeFullURL = myMashapeURL(memeURL, memeArray);
				console.log("Querying the url:\n", memeFullURL);
				unirest.get(memeFullURL)
				    .header(config.apiKeyName, config.apiKeyValue)
				    .header("Accept", memeContentType)
				    .end(function(memeResponse){
					    responseLogger(memeResponse);
					}).pipe(res);
			    });
		});
    });
		
var server = app.listen(port, function () {
	console.log("STARTING UP");
    });
