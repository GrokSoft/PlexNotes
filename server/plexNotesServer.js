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
 * PlexNotes REST Server
 */
(function () {
    var PORT = 8080;
    var dataFile = "plexData.json";     /** The file to save the plex data in */
    var fs = require('fs');             /** The file system */
    var restify = require('restify');   /** REST Server */

    var plexData = [
        {
            "id" : 1,
            "user" : "Bill",
            "priority" : 3,
            "status" : 3,
            "Notes" : "",
            "issues" : [
                "3",
                "6"
            ]
        },
        {
            "id" : 2,
            "user" : "Todd",
            "priority" : 2,
            "status" : 1,
            "Notes" : "a note",
            "issues" : [
                "2",
                "4"
            ]
        }
    ];
    var idLast = plexData[plexData.length - 1].id; /** id to used to create the next issue */

    /**
     * Issue Priorities
     */
    var plexPriorites = {
        "1": "Extremely Important",
        "2" : "Important",
        "3" : "Not Important"
    };

    /**
     * Issue Statuses
     */
    var plexStatuses = {
        "1" : "Being Worked",
        "2" : "On Hold",
        "3" : "Completed"
    };

    /**
     * Plex Issues
     */
    var plexIssues = {
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
    };
    var server = restify.createServer({name: 'PlexNotes Server',  formatters: {
        'application/json': function(req, res, body, cb) {
            return cb(null, JSON.stringify(body, null, '\t'));
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

    server.use(restify.fullResponse());
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    //server.use(restify.CORS());

    //
    // Common REST  routs
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
        res.send('hello ' + req.params.name + ' it works! (' + param + ')\n\n');
        next();
    }


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
     *  "Notes" : "",
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

        console.log(plexData);

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            var issue;/* = typeof req.body !== "string"
                ? req.body.toString()
                : JSON.parse(req.body).body;*/
            issue = req.body.toString();
            //issue = issue.replace(/"/g, "");
            idLast++;
            // Todo Figure out how to pass the issue data!!!
            //issue.id = idLast;

            ret = JSON.parse(JSON.stringify(issue));
            //ret = ret.replace(/"/g, "");
            //
            // Todo Cannot figure out how to get rid of the quotes around the json object.
            // which makes the data file invalid!
            // I've tried every combo of the following:
            // obj.toString()
            // JSON.stringify(obj)
            // JSON.parse(obj);
            // obj.toJSON()
            //
            console.log(ret);
            /*{
                "id": idLast,
                "user" : "Bill",
                "priority" : 3,
                "status" : 3,
                "Notes" : "",
                "issues" : [
                    "3",
                    "6"
                ]
            };*/

            //plexData.push(JSON.parse(JSON.stringify(ret)));
            plexData.push(ret);
            saveIssues();
        }
        catch (e) {
            console.log("Error "+issue);
            res.statusCode = 400;
            //ret = "data invalid";
        }
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
     * Load the passed response with a 404 Not Found error and return the error text
     *
     * @param res  The response to modify
     * @returns {string} Note NOT found
     */
    var notFound = function (res) {
        res.statusCode = 404;
        return "Note NOT found";
    };

    /**
     * Save the notes to a file
     */
    var saveIssues = function () {
        fs.writeFile(dataFile, JSON.stringify(plexData), function (err) {
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

                    // Iterate through the notes to find the largest ID number in case it was manually edited.
                    plexData.forEach(function (node) {
                        //console.log("idLast = %s note.id = %s", idLast, note.id);
                        idLast = Math.max(idLast, parseInt(node.id));
                    });
                    console.log("There are %d issues available.", plexData.length);
                });
            }
            else {
                console.log("No Data file - using the default data");
            }
        });
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