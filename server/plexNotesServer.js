/**
 * Created by trh on 8/13/16.
 *
 * Test with:
 *      curl -is http://localhost:8080/hello/mark -H 'accept: text/plain'
 *      curl -is http://localhost:8080/hello/mark
 *      curl -is http://localhost:8080/hello/mark -X HEAD -H 'connection: close'
 *      curl -is http://localhost:8080/hello/bill?whatever='this is a parameter'
 *
 *      curl -is http://localhost:8080/confirm/bill -H 'accept: text/plain'
 *      curl -is http://localhost:8080/confirm/john
 *      curl -is http://localhost:8080/confirm/chewbaca -X HEAD -H 'connection: close'
 */
'use strict';

/**
 * Get Lorem Ipsum text.
 * If start and/or end are not passed they will be randomly generated.
 *
 * @param start
 * @param len
 * @returns {string}
 */
var loremIpsum = function (start, len) {
    var MIN = 10;   /** The minimum number of characters to return. */
    var loremIpsumTxt = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

    if( start == undefined )
        start = Math.random() * loremIpsumTxt.length-MIN;
    if( len == undefined )
        len = Math.max(start-1, parseInt(Math.random() * loremIpsumTxt.length-MIN ));

    return loremIpsumTxt.substr(start,len);
};

/**
 * PlexNotes REST Server
 */
(function () {

    var PORT = 8080;
    var dataFile = "plexData.json";     /** The file to save the plex data in */
    var fs = require('fs');             /** The file system */
    var restify = require('restify');   /** REST Server */

    // The following data contains all of the data used in the UI
    var plexData = [
        {
            "id" : 1,
            "user" : "Bill",
            "priority" : 1,
            "status" : 1,
            "notes" : loremIpsum(),
            "issues" : [
                1,
                2
            ]
        },
        {
            "id" : 2,
            "user" : "Todd",
            "priority" : 2,
            "status" : 2,
            "notes" : loremIpsum(),
            "issues" : [
                3,
                4,
                5
            ]
        },
            {
                "id" : 3,
                "user" : "Todd",
                "priority" : 3,
                "status" : 3,
                "notes" : loremIpsum(),
                 "issues" : [
                    6,
                    7,
                    8,
                    9,
                    10
                ]
            }

    ];
    var idLast = parseInt(plexData[plexData.length - 1].id); /** id to used to create the next issue */

    /**
     * Issue Priorities
     */
    var plexPriorites = [
        "Extremely Important",
        "Important",
        "Not Important"
    ];

    /**
     * Issue Statuses
     */
    var plexStatuses = [
        "Open",
        "Closed",
        "Being Worked",
        "On Hold",
        "Completed"
    ];

    /**
     * Plex Issues
     */
    var plexIssues = [
        "See Notes",
        "Needs Subtitles",
        "Needs Forced Subtitles",
        "Error Streaming",
        "Choppy Streaming",
        "Low Resolution",
        "Bad Audio",
        "Low Audio",
        "High Audio",
        "Add Artwork",
        "See Notes"
    ];
    /*var plexIssues = {
        "1" : "Needs Subtitles",
        "2" : "Needs Forced Subtitles",
        "3" : "Error Streaming",
        "4" : "Choppy Streaming",
        "5" : "Low Resolution",
        "6" : "Bad Audio",
        "7" : "Low Audio",
        "8" : "High Audio",
        "9" : "Add Artwork",
        "10" : "See Notes"
    };*/

    // Create the restify server
    // Add a filter to beautify json output so it's on multiple lines.
    var server = restify.createServer({name: 'PlexNotes Server',  formatters: {
        'application/json': function(req, res, body, cb) {
            var ret;
            //console.log("body = "+ JSON.stringify(body));
            try {
                ret = cb(null, JSON.stringify(body, null, '\t'));
            } catch(e) {
                res.statusCode = 400;
                ret = badRequest(body);
                console.log("Error = "+ body);
            }
            //console.log(ret);
            return ret;
        }
    }});

    // Load the plugins
/*
    server.use(restify.acceptParser(server.acceptable));// Parses out the Accept header, and ensures that the server can respond to what the client asked for. You almost always want to just pass in server.acceptable here, as that's an array of content types the server knows how to respond to (with the formatters you've registered). If the request is for a non-handled type, this plugin will return an error of 406.
    server.use(restify.authorizationParser());          // Parses out the Authorization header as best restify can. Currently only HTTP Basic Auth and HTTP Signature schemes are supported. When this is used, req.authorization will be set to something like:
    server.use(restify.CORS());                         // Supports tacking CORS headers into actual requests (as defined by the spec). Note that preflight requests are automatically handled by the router, and you can override the default behavior on a per-URL basis with server.opts(:url, ...).
    server.use(restify.dateParser());                   // Parses out the HTTP Date header (if present) and checks for clock skew (default allowed clock skew is 300s, like Kerberos). You can pass in a number, which is interpreted in seconds, to allow for clock skew.
    server.use(restify.queryParser());                  // Parses the HTTP query string (i.e., /foo?id=bar&name=mark). If you use this, the parsed content will always be available in req.query, additionally params are merged into req.params. You can disable by passing in mapParams: false in the options object.
    server.use(restify.jsonp());                        // Supports checking the query string for callback or jsonp and ensuring that the content-type is appropriately set if JSONP params are in place. There is also a default application/javascript formatter to handle this. You should set the queryParser plugin to run before this, but if you don't this plugin will still parse the query string properly.
    server.use(restify.gzipResponse());                 // If the client sends an accept-encoding: gzip header (or one with an appropriate q-val), then the server will automatically gzip all response data. Note that only gzip is supported, as this is most widely supported by clients in the wild.
    server.use(restify.bodyParser());                   // Blocks your chain on reading and parsing the HTTP request body. Switches on Content-Type and does the appropriate logic. application/json, application/x-www-form-urlencoded and multipart/form-data are currently supported.
    server.use(restify.requestLogger());                // Sets up a child bunyan logger with the current request id filled in, along with any other parameters you define.
    server.use(restify.throttle());                     // Restify ships with a fairly comprehensive implementation of Token bucket, with the ability to throttle on IP (or x-forwarded-for) and username (from req.username). You define "global" request rate and burst rate, and you can define overrides for specific keys. Note that you can always place this on per-URL routes to enable different request rates to different resources (if for example, one route, like /my/slow/database is much easier to overwhlem than /my/fast/memcache).
    server.use(restify.conditionalRequest());           // You can use this handler to let clients do nice HTTP semantics with the "match" headers. Specifically, with this plugin in place, you would set res.etag=$yourhashhere, and then this plugin will do one of: return 304 (Not Modified) [and stop the handler chain], return 412 (Precondition Failed) [and stop the handler chain], Allow the request to go through the handler chain.
    server.use(restify.fullResponse());                 // sets up all of the default headers for the system
    server.use(restify.bodyParser());                   // remaps the body content of a request to the req.params variable, allowing both GET and POST/PUT routes to use the same interface
*/

    server.use(restify.jsonp());
    //server.use(restify.fullResponse());
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    //server.use(restify.CORS());

    //
    // Common REST routs
    //

    /**
     * Respond with name passed and parameter
     *
     * @param req
     * @param res
     * @param next
     */
    function respond(req, res, next) {
        var param = req.query.whatever;
        console.log("Received %s",req.params.name);
        setResponseHeader(res);
        res.send('hello ' + req.params.name + ' it works! (' + param + ')\n\n');
        next();
    }

    //
    // Data for GUI rest routes
    //

    server.get('api/data/add/:count', function (req, res, next) {
        var ret;
        var issue;
        var count = req.params.count;

        for( var i=0 ; i<count; i++ ){

            issue = createRandomIssues();

            plexData.push(issue);
            console.log("issue = "+JSON.stringify(issue));
        }

        saveIssues();
        setResponseHeader(res);

        res.json(ret);
        next();
    });


    /**
     * Get the Plex issue priorities
     *
     * get /api/data/priorities
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  Plex issue priorities
     */
    server.get('api/data/priorities', function (req, res, next) {
        var ret = plexPriorites;
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    /**
     * Get the Plex issue statuses
     *
     * get /api/data/statuses
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  Plex issue statuses
     */
    server.get('api/data/statuses', function (req, res, next) {
        var ret = plexStatuses;
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    /**
     * Get the Plex issue issues
     *
     * get /api/data/issues
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  Plex issue issues
     */
    // Todo - Is there a better names for these, since the whole thing is already an issue
    server.get('api/data/issues', function (req, res, next) {
        var ret = plexIssues;
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    //
    // REST routes
    //

    /**
     * Get all issues with optional query parameter
     *
     * get /api/issues
     * get /api/issues?query=movie
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('/api/issues', function (req, res, next) {
        var ret = [];
        var query = req.query.query;

        plexData.forEach(function (node) {
            // Test for a query string
            if (query === undefined || node.search(query) != -1)
                ret.push(node);
        });
        if (ret.length == 0) {
            ret = notFound(res);
        }

        setResponseHeader(res);
        res.json(ret);
        next();
    });


    /**
     * Get a issues by id
     *
     * get /api/issues/{id}
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('/api/issues/:id', function (req, res, next) {
        // There can not be duplicate notes, so always use the first element returned.
        var ret = plexData.filter(function (node) {
            return node.id == req.params.id;
        })[0];
        if (ret === undefined) {
            ret = notFound(res);
        }
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    /**
     * Create a new issue
     *
     * post api/issues ( body = {
     *  "id" : 1,
     *  "user" : "Bill",
     *  "priority" : 3,
     *  "status" : 3,
     *  "notes" : "",
     *  "issues" : [
     *  "3",
     *  "6"
     *  }])
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next rout in the chain
     *
     * @returns  The new issue, or 400 if the issue could not be created.
     */
    server.post('/api/issues', function (req, res, next) {
        var ret;

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            var issue;/* = typeof req.body !== "string"
                ? req.body.toString()
                : JSON.parse(req.body).body;*/
                /*
                    Todo Leaving this comment in until this has been tested with curl and the real app.
                    The json - string functions
                    JSON.stringify();
                    JSON.parse();
                    jSON.toString();
                    issue.toJSON()
                    issue.toJson();
                */

            issue = req.body;
            idLast++;
            issue.id = idLast;
            ret = issue;
            plexData.push(ret);
            saveIssues();
        }
        catch (e) {
            console.log("Error "+issue);
            res.statusCode = 400;


            ret = badRequest(issue);
        }
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    /**
     *
     */
    server.get('/hello/:name', respond);

    /**
     *
     */
    server.head('/hello/:name', respond);

    /**
     * Respond with name passed
     *
     * @param req
     * @param res
     * @param next
     */
    server.get('/confirm/:name', function (req, res, next) {
        res.send('confirm ' + req.params.name + ' it works!' + '\n\n');
        next();
    });

    //
    // Misc functions
    //



    /**
     * Set the header for the response
     *
     * Adds Access-Control-Allow-Origin *
     * and
     * Access-Control-Allow-Headers X-Requested-With
     * to the header, so we can call REST servers on other domains.
     *
     * Note: This is needed to debug in IntelliJ/WebStorm.
     * The server runs under one port, and the web app runs under another.
     *
     * @param res
     */
    var setResponseHeader = function (res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
    };

    /**
     * Return a json error showing a bad request
     *
     * @param body
     * @returns {{jse_shortmsg: string, jse_info: {}, message: string, statusCode: number, body: {code: string, message: string}, restCode: string}}
     */
    var badRequest = function (body) {
        var retJson = {
            "jse_shortmsg": "Invalid Data",
            "jse_info": {},
            "message": "Body contained invalid Data",
            "statusCode": 400,
            "body": {
                "code": "BadRequest",
                "message": "data invalid Body = "+body
            },
            "restCode": "BadRequest"
        };
        return retJson;
    };

    /**
     * Load the passed response with a 404 Not Found error and return the error text
     *
     * @param res  The response to modify
     * @returns {string} Note NOT found
     */
    var notFound = function (res) {
        res.statusCode = 404;
        var retJson = {
            "jse_shortmsg": "Issue not found",
            "jse_info": {},
            "message": "Requested issue was not found",
            "statusCode": 404,
            "body": {
                "code": "NotFound",
                "message": "Issue was not found!"
            },
            "restCode": "NotFound"
        };

        return retJson;
    };

    /**
     * Save the notes to a file
     */
    var saveIssues = function () {
        fs.writeFile(dataFile, JSON.stringify(plexData, null, 4), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved with %d issues.", plexData.length);
        });
    };

    /**
     * Get the issues from the file.
     */
    var getIssues = function () {
        fs.exists(dataFile, function (exists) {
            if (exists) {
                fs.readFile(dataFile, function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    plexData = JSON.parse(data);

                    /**
                     * Find the last id used so it can be incremented for a new note.
                     */
                    // If the file can not be manually edited we can get the largest id with the following
                    // idLast = notes[notes.length-1].id;
                    console.log("idLast = "+idLast);
                    // Iterate through the notes to find the largest ID number in case it was manually edited.
                    plexData.forEach(function (node) {
                        console.log("idLast = %s note.id = %s", idLast, node.id);
                        idLast = parseInt(Math.max(idLast, parseInt(node.id)));
                    });
                    console.log("idLast = "+idLast);
                    console.log("There are %d issues available.", plexData.length);
                });
            }
            else {
                console.log("No Data file - using the default data");
            }
        });
    };


    var createRandomIssues = function () {
        var issueCnt;
        var issueNum;
        var users = [ "Bill" +
        "", "Todd", "Sarah", "Reid", "Erin", "Ellissa"];
        var issue = {
            "id" : 0,
            "user" : "",
            "priority" : 0,
            "status" : 0,
            "notes" : loremIpsum(),
            "issues" : []
        };

        console.log("idLast "+idLast);
        issue.id = ++idLast;
        issue.user = users[parseInt(Math.random()*users.length)];
        issue.priority = parseInt(Math.random()*plexPriorites.length);
        console.log("issue.priority "+issue.priority);
        issue.status = parseInt(Math.random()*plexStatuses.length);
        issue.notes = loremIpsum();

        // Ensure we have at least 1 issue.
        issueCnt = Math.max(1, parseInt(Math.random()*plexIssues.length));
        console.log("issueCnt "+ issueCnt);
        for( var j = 0; j < issueCnt; j++ ) {
            for( var k = 0; k < issueCnt; k++ ) {
                issueNum = parseInt(Math.random()*plexIssues.length);
                var isUsed = issue.issues.find(function (node) {
                    console.log("node "+node);
                    return node == issueNum;
                });
                console.log("isUsed "+isUsed);
                if( isUsed == undefined ) {
                    console.log("issueNum"+ issueNum);
                    issue.issues.push(issueNum);
                    break;
                }
            }
        }
        console.log("createIssue = "+JSON.stringify(issue));
        return issue;
    };

    //
    // Initialization
    //

    // Load the issues if the file exists.
    getIssues();

    // Have restify listen on the configured port
    server.listen(PORT, function () {
        console.log('%s listening at %s', server.name, server.url);
    });

})();