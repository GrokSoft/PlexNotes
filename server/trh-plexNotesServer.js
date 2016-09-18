/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

/**
 * PlexNotes REST Server
 *
 * This is the main module and start-up point for the PlexNotes REST Server
 */
(function () {

    //=================================================================================================================
    // Initialization

    var LOGFILE = '../logs/plex-notes.log';                    // relative to www directory
    var VERSION = '0.01.00';

    // configuration parameters
    // todo: move configuration parameters to a configuration file
    var serverPort = 8080;
    var dbType = 2;                                             // 0=static  1=JSON  2=SQLite  3=MySQL/MariaDB  4=MSSQL  5=Postgres
    var dbName = 'plex-notes.sqlite';                           // must make sense with dbType
    var loglevel = 'info';                                      // logging level

    // modules
    var commandLineArgs = require('command-line-args')
    var dStore = require('./datastore.js').Datastore;           // PlexNotes datastore API
    var dsStatic = require('./datastore-static.js');            // always load for priming
    var fs = require('fs');                                     // file system
    var logger = require('winston');                            // logger
    var restify = require('restify');                           // REST Server
    var utils = require('./utils.js').Utils;                    // server utilities

    var routes = {
        "GET": [],
        "POST": [],    // create
        "PUT": [],     // update
        "DELETE": []
    };

    // setup logging where level == error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
    logger.add(logger.transports.File, {filename: LOGFILE, level: loglevel});
    logger.log('info', '==== PlexNotes Server StartUp =============================================');
    logger.log('info', 'Version: ' + VERSION);
    logger.log('info', "__dirname " + __dirname);

    // todo: read a configuration file here

    var commandArgs = [
        {name: 'generate', alias: 'g', type: Number, description: 'generate N faux notes for testing'},
        {name: 'help', alias: '?', type: Boolean, description: 'this help'},
        {name: 'verbose', alias: 'v', type: Boolean, description: 'verbose logging'}
    ];

    var options = commandLineArgs(commandArgs);

    // Initialize the datastore interface
    if (dStore.init(dbType, dbName, logger) == false) {
        logger.log('error', 'Could not connect to datastore');
        return 1;
    }

    if (options.generate > 0) {
        logger.log('info', 'Generate ' + options.generate + ' faux notes');
        utils.createRandomNotes(options.generate, dStore);
        return 0;
    }

    // Create the restify server
    // Add a filter to beautify json output so it's on multiple lines.
    logger.log('info', 'Creating PlexNotes server');
    var server = restify.createServer({
        name: 'PlexNotes Server',
        formatters: {
            'application/json': function (req, res, body, cb) {
                var ret;
                logger.log('debug', "body = " + JSON.stringify(body));
                try {
                    ret = cb(null, JSON.stringify(body, null, '\t'));
                } catch (e) {
                    res.statusCode = 400;
                    ret = utils.badRequest(body);
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

    // Set up  HTTP server on www/
    // This serves up the static webapp
    server.get(/www\/?.*/, restify.serveStatic({
        directory: __dirname + '/../'

    }));


    //=================================================================================================================
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
     * @returns  PlexNotes categories
     */
    server.get('api/data/categories', function (req, res, next) {
        logger.log('info', "Processing GET api/data/categories");
        dStore.getCategories().then(function (categories) {
            if (categories === undefined || categories.length == 0) {
                categories = utils.notFound(res);
            }
            res = utils.setResponseHeader(res);
            res.json(categories);
            next();
        });
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
        dStore.getPriorities().then(function (priorities) {
            if (priorities === undefined || priorities.length == 0) {
                priorities = utils.notFound(res);
            }
            res = utils.setResponseHeader(res);
            res.json(priorities);
            next();
        });
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
        dStore.getStatuses().then(function (statuses) {
            if (statuses === undefined || statuses.length == 0) {
                statuses = utils.notFound(res);
            }
            utils.setResponseHeader(res);
            res.json(statuses);
            next();
        });
    });


    //=================================================================================================================
    // REST api routes
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/notes
     * get api/notes?query=movie
     *
     * @description Get all notes with optional query parameter. If query is in URL a WHERE clause is built with
     * that value. If the query is in the BODY it is taken literally without changes. Note that a BODY query is
     * a WHERE clause that must formatted as required by the Sequelize module,
     * see http://docs.sequelizejs.com/en/v3/docs/querying/#where. An empty query will return ALL records.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('api/notes', function (req, res, next) {
        var ret = [];
        var query = undefined;
        var src = dStore.SRC_UNDEFINED;
        if (req.query.query != undefined) {
            src = dStore.SRC_URL;
            query = req.query.query;
        } else if (req.body != undefined) {
            src = dStore.SRC_BODY;
            query = req.body;
        }
        logger.log('info', "Processing GET api/notes");
        dStore.getNotes(src, query).then(function (notes) {
            if (notes == undefined || notes.length == 0) {
                ret = utils.notFound(res);
            }
            utils.setResponseHeader(res);
            res.json(notes);
            next();
        })
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/notes/{uuid}
     *
     * @description Get a notes by uuid. The uuid request must be in the URL.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('api/notes/:uuid', function (req, res, next) {
        var ret = [];
        var query = req.params.uuid;
        if (query === undefined) {
            res.statusCode = 400;
            ret = utils.badRequest("A uuid key value is required for this request");
            utils.setResponseHeader(res);
            res.json(notes);
            next();
        } else {
            logger.log('info', "Processing GET api/notes/" + query);
            dStore.getNotes(dStore.SRC_UUID, query).then(function (notes) {
                if (notes === undefined || notes.length == 0) {
                    notes = utils.notFound(res);
                }
                utils.setResponseHeader(res);
                res.json(notes);
                next();
            });
        }
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
        utils.setResponseHeader(res);
        res.json(ret);
        next();
    });


    //=================================================================================================================
    // POST
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name post api/notes
     *
     * @description Save a note. The note JSON is in body. A new uuid will be generated.
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

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            var note;
            /* = typeof req.body !== "string"
             ? req.body.toString()
             : JSON.parse(req.body).body;*/
            note = req.body;
            note.uuid = utils.getUUID();
            note.last_utc = Date.now();
            ret = dStore.saveNote(note).then(function (fullNote) {
                    return fullNote;
                },
                function (xhrObj) {
                    var t = xhrObj.toString();
                    Error(utils.ReturnObject(201, "Created", "api/notes failure: ", t));
                }
            );
            res.statusCode = 201;
        }
        catch (e) {
            logger.log('error', e);
            ret = utils.badRequest(note);
        }
        utils.setResponseHeader(res);
        res.json(ret);
        next();
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name post api/data/generate/:count
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
    server.post('api/data/generate/:count', function (req, res, next) {
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
        utils.setResponseHeader(res);

        res.json(retJson);
        next();
    });


    //=================================================================================================================
    // DELETE
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name delete api/notes/{uuid}
     *
     * @description
     * Delete an notes by uuid
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested note or 404
     */
    server.del('api/notes/:id', function (req, res, next) {
        var ret = [];
        var uuid = req.params.uuid;
        if (uuid === undefined || uuid.length < 1) {
            ret = utils.badRequest("A uuid key value is required for this request");
            utils.setResponseHeader(res);
            res.json(ret);
            next();
        } else {
            logger.log('info', "Processing DELETE api/notes/:id" + req.params.id);
            dStore.deleteNote(uuid).then(function (count) {
                if (count === undefined || count < 1) {
                    ret = utils.notFound(res);
                }
                utils.setResponseHeader(res);
                res.json(ret);
                next();
            });
        }
    });

    //=================================================================================================================
    // Miscellaneous
    //

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
        routes.POST = [];
        server.router.routes.POST.forEach(
            function (value) {
                routes.POST.push(value.spec.path.toString());
            }
        );
        routes.PUT = [];
        server.router.routes.PUT.forEach(
            function (value) {
                routes.PUT.push(value.spec.path.toString());
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
    // Start-up

    // List all the routes
    logger.log('info', "Available Route Paths: " + JSON.stringify(listAllRoutes(server), null, 4));

    // var uid = utils.getUUID();
    // console.log('uuid = ' + uid);

    // test data queries
    // var cats;
    // cats = dStore.getCategories();
    // var pris;
    // pris = dStore.getPriorities();
    // var stas;
    // stas = dStore.getStatuses();
    //
    // var now = utils.getNow();
    // var note = {
    //     uuid: utils.getUUID(),
    //     fk_categories_uuid: '7c0fc735-1e7e-4f3f-b57b-3a8d2e47a14b',
    //     fk_priorities_uuid: '16e106f1-0766-47df-b08e-d6c0fc5d91c3',
    //     fk_statuses_uuid: '93a30a13-140d-418a-8c71-f8c9a5c59628',
    //     fk_users_uuid: 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
    //     fk_modifier_users_uuid: 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
    //     plex_server_uuid: '955dec84-bea6-417f-98b6-dcf8308b002a',
    //     created_date: now,
    //     modified_date: now,
    //     last_utc: now,
    //     title: "The FIRST TEST to the database!",
    //     details: "Now is the time for all good men to come to the aid of their country.",
    //     opt_in: 1
    // };
    // dStore.saveNote(note).then(function (noteret) {
    //     var aNote = noteret;
    //     console.log('note added=' + JSON.stringify(aNote, null, 4));
    // });




    // Have restify listen on the configured port
    // server.use("../www");
    server.listen(serverPort, function () {
        logger.log('info', '%s listening at %s', server.name, server.url);
    });

})();
