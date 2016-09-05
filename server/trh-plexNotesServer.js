/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

/**
 * PlexNotes REST Server
 */
(function () {
    const LOGFILE = '../logs/plex-notes.log';                    // relative to www directory
    const VERSION = '0.01.00';

    // configuration parameters
    // todo: move these to a configuration file
    var serverPort = 8080;
    var dbType = 2;                                             // 0=static  1=JSON  2=SQLite  3=MySQL/MariaDB  4=MSSQL  5=Postgres
    var dbName = 'plex-notes.sqlite';                           // must make sense with dbType
    var loglevel = 'info';                                      // logging level

    // modules
    var dStore = require('./datastore.js').Datastore;           // PlexNotes datastore API
    var dsStatic = require('./datastore-static.js');            // always load for priming
    var fs = require('fs');                                     // file system
    var logger = require('winston');                            // logger
    var restify = require('restify');                           // REST Server
    var utils = require('./utils.js');                          // server utilities

    var routes = {
        "GET": [],
        "PUT": [],     // update
        "POST": [],    // create
        "DELETE": []
    };

    // todo: read a configuration file here

    // setup logging where level == error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
    logger.add(logger.transports.File, {filename: LOGFILE, level: loglevel});
    logger.log('info', '==== PlexNotes Server StartUp =============================================');
    logger.log('info', 'Version: ' + VERSION);

    // Initialize the datastore interface
    if (dStore.init(dbType, dbName, logger) == false) {
        logger.log('error', 'Could not connect to datastore');
        return 1;
    }

    // Create the restify server
    // Add a filter to beautify json output so it's on multiple lines.
    logger.log('info', 'Creating PlexNotes server');
    var server = restify.createServer({
        name: 'PlexNotes Server',
        formatters: {
            'application/json': function (req, res, body, cb) {
                var ret;
                logger.log('debug', "body = "+ JSON.stringify(body));
                try {
                    ret = cb(null, JSON.stringify(body, null, '\t'));
                } catch (e) {
                    res.statusCode = 400;
                    ret = badRequest(body);
                    logger.log('error', body);
                }
                logger.log('verbose', 'return = ' + ret);
                return ret;
            }
        }
    });

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

    //server.use(restify.fullResponse());
    server.use(restify.queryParser());
    server.use(restify.bodyParser());
    server.use(restify.jsonp());
    //server.use(restify.CORS());

    logger.log('info', "__dirname " + __dirname);

    // Set up  HTTP server on www/
    // This serves up the static webapp
    server.get(/www\/?.*/, restify.serveStatic({
        directory: __dirname + '/../'

    }));


    //=================================================================================================================
    // PlexNotes Server - Application Program Interface
    //=================================================================================================================


    //-----------------------------------------------------------------------------------------------------------------
    // REST data routes
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/data/categories
     *
     * @description
     * Get the PlexNotes categories
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  PlexNotes issues
     */
    server.get('api/data/categories', function (req, res, next) {
        logger.log('info', "Processing GET api/data/categories");
        var ret = dStore.getCategories();
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/data/priorities
     *
     * @description
     * Get the PlexNotes priorities
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  PlexNotes priorities
     */
    server.get('api/data/priorities', function (req, res, next) {
        logger.log('info', "Processing GET api/data/priorities");
        var ret = dStore.getPriorities();
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/data/statuses
     *
     * @description
     * Get the PlexNotes statuses
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  PlexNotes statuses
     */
    server.get('api/data/statuses', function (req, res, next) {
        logger.log('info', "Processing GET api/data/statuses");
        var ret = dStore.getStatuses();
        setResponseHeader(res);
        res.json(ret);
        next();
    });


    //-----------------------------------------------------------------------------------------------------------------
    //
    // REST api routes
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/notes
     * get api/notes?query=movie
     *
     * @description
     * Get all notes with optional query parameter
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('api/notes', function (req, res, next) {
        var ret = [];
        var query = req.query.query;
        logger.log('info', "Processing GET api/notes");
        ret = dStore.getNotes(query);
        if (ret.length == 0) {
            ret = notFound(res);
        }
        setResponseHeader(res);
        res.json(ret);
        next();
    });


    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/notes/{id}
     *
     * @description
     * Get a notes by id
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('api/notes/:id', function (req, res, next) {
        // There can not be duplicate notes, so always use the first element returned.
        var ret = dsStatic.plexData.filter(function (node) {
            return node.id == req.params.id;
        })[0];
        if (ret === undefined) {
            ret = notFound(res);
        }
        logger.log('info', "Processing GET api/notes/" + req.params.id);

        setResponseHeader(res);
        res.json(ret);
        next();
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/routes
     *
     * @description
     * Get the routes from the server
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  A list of available routes
     */
    server.get('api/routes', function (req, res, next) {
        var ret;

        logger.log('info', "Processing GET api/routes");

        ret = listAllRoutes(server);

        setResponseHeader(res);
        res.json(ret);
        next();
    });


    //-----------------------------------------------------------------------------------------------------------------
    // POST
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name post api/notes
     *
     * @description
     * Create a new note
     * ( body = {
     *  "id" : 1,
     *  "title"   : "",
     *  "user" : "Bill",
     *  "emailme", false,
     *  "priority" : 3,
     *  "status" : 3,
     *  "details" : "",
     *  "issues" : [
     *  "3",
     *  "6"
     *  }])
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The new note, or 400 if the note could not be created.
     */
    server.post('api/notes', function (req, res, next) {
        var ret;

        logger.log('info', "Processing POST api/notes");

        // Get the notes in case they were change
        DatastoreJson.getNotes();

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            var note;
            /* = typeof req.body !== "string"
             ? req.body.toString()
             : JSON.parse(req.body).body;*/

            note = req.body;
            idLast++;
            note.id = idLast;
            ret = note;
            plexData.push(ret);
            DatastoreJson.saveNotes();
            res.statusCode = 201;
        }
        catch (e) {
            logger.log('error', e);
            res.statusCode = 400;
            ret = badRequest(note);
        }
        setResponseHeader(res);
        res.json(ret);
        next();
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name post api/data/add/:count
     *
     * @description
     * Create random notes for testing
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  PlexNotes priorities
     */
    server.post('api/data/add/:count', function (req, res, next) {
        var note;
        var count = req.params.count;
        var retJson = {
            "jse_shortmsg": count + " Notes added",
            "jse_info": {},
            "message": "Notes successfully added",
            "statusCode": 201,
            "body": {
                "code": "Created",
                "message": "Successfully added " + count + " notes."
            },
            "restCode": "Created"
        };

        logger.log('info', "Processing POST api/data/add/" + count);

        for (var i = 0; i < count; i++) {
            note = dsStatic.createRandomNote();
            plexData.push(note);
            logger.log('debug', "note = " + JSON.stringify(note));
        }

        DatastoreJson.saveNotes();
        setResponseHeader(res);

        res.json(retJson);
        next();
    });


    //-----------------------------------------------------------------------------------------------------------------
    // DELETE
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name delete api/notes/{id}
     *
     * @description
     * Delete an notes by id
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested note or 404
     */
    server.del('api/notes/:id', function (req, res, next) {
        // There can not be duplicate notes, so always use the first element returned.
        var ret = dsStatic.plexData.filter(function (node) {
            return node.id == req.params.id;
        })[0];
        if (ret === undefined) {
            ret = notFound(res);
        } else {
            var index = plexData.indexOf(ret);
            plexData.splice(index, 1);
            DatastoreJson.saveNotes();
        }
        logger.log('info', "Processing DELETE api/notes/" + req.params.id);

        setResponseHeader(res);
        res.json(ret);
        next();
    });


    //=================================================================================================================
    // Common REST routes and supporting methods
    //


    //-----------------------------------------------------------------------------------------------------------------
    /**
     * Respond with name passed and parameter
     *
     * @param req
     * @param res
     * @param next
     */
    function respond(req, res, next) {
        var param = req.query.whatever;
        logger.log('info', "Received %s", req.params.name);
        setResponseHeader(res);
        res.send('hello ' + req.params.name + ' it works! (' + param + ')\n\n');
        next();
    }

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name setResponseHeader
     *
     * @description
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

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name badRequest
     *
     * @description
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
                "message": "data invalid Body = " + body
            },
            "restCode": "BadRequest"
        };
        return retJson;
    };

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name notFound
     *
     * @description
     * Load the passed response with a 404 Not Found error and return the error text
     *
     * @param res  The response to modify
     * @returns {string} Note NOT found
     */
    var notFound = function (res) {
        res.statusCode = 404;
        var retJson = {
            "jse_shortmsg": "Note not found",
            "jse_info": {},
            "message": "Requested note was not found",
            "statusCode": 404,
            "body": {
                "code": "NotFound",
                "message": "Note was not found!"
            },
            "restCode": "NotFound"
        };

        return retJson;
    };

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name listAllRoutes
     *
     * @description
     * Get all available route paths
     *
     * @param server
     */
    var listAllRoutes = function (server) {

        routes.GET = [];
        server.router.routes.GET.forEach(
            function (value) {
                routes.GET.push(value.spec.path.toString());
            }
        );
        routes.PUT = [];
        server.router.routes.PUT.forEach(
            function (value) {
                routes.PUT.push(value.spec.path.toString());
            }
        );
        routes.POST = [];
        server.router.routes.POST.forEach(
            function (value) {
                routes.POST.push(value.spec.path.toString());
            }
        );
        routes.DELETE = [];
        server.router.routes.DELETE.forEach(
            function (value) {
                routes.DELETE.push(value.spec.path.toString());
            }
        );

        logger.log('debug', JSON.stringify(routes, null, 4));
        return (routes);
    };


    //=================================================================================================================
    // Initialization & Start-up
    //=================================================================================================================

    // List all the routes
    logger.log('info', "Available Route Paths: " + JSON.stringify(listAllRoutes(server), null, 4));

    // var uid = utils.getUUID();
    // console.log('uuid = ' + uid);

    var cats = dStore.getCategories();


    // Have restify listen on the configured port
    // server.use("../www");
    server.listen(serverPort, function () {
        logger.log('info', '%s listening at %s', server.name, server.url);
    });

})();
