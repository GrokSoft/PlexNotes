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
    var LOGFILE = '../logs/plex-notes.log';                    // relative to www directory
    var VERSION = '0.01.00';

    // configuration parameters
    // todo: move configuration parameters to a configuration file
    var serverPort = 8080;
    var dbType = 2;                                             // 0=static  1=JSON  2=SQLite  3=MySQL/MariaDB  4=MSSQL  5=Postgres
    var dbName = 'plex-notes.sqlite';                           // must make sense with dbType
    var loglevel = 'info';                                      // logging level

    // modules
    var commandLineArgs = require('command-line-args');
    var dStore = require('./datastore.js').Datastore;           // PlexNotes datastore API
    var dsStatic = require('./datastore-static.js');            // always load for priming
    var fs = require('fs');                                     // file system
    var logger = require('winston');                            // logger
    var restify = require('restify');                           // REST Server
    var utils = require('./utils.js').Utils;                    // server utilities
    var wait = require('wait-promise');

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
    if (dStore.init(dbType, dbName, logger) == false) {             // ! need to handle Promise if priming a new db
        logger.log('error', 'Could not connect to datastore');
        return 1;
    }

    if (options.generate > 0) {
        var cnt;
        logger.log('info', 'Generate ' + options.generate + ' faux notes');
        cnt = utils.createRandomNotes(options.generate, dStore).then(function() {       // ! need to handle Promise
            var prom = wait.until(function () {
                var b = utils.generateFlag;
                return b;
            });

            prom.then(function () {
                console.log("Created " + options.generate + " random notes");
                exit;
                //return 0;
            });
        });
    } else {
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
    // GET data                                                                                                GET data
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/data/categories
     *
     * @description
     * Get all PlexNotes categories
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
     * Get all PlexNotes priorities
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
     * Get all PlexNotes statuses
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
    // GET api                                                                                                  GET api
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/notes
     * get api/notes?query=movie
     *
     * @description
     * Get all notes with optional query parameter. If query is in URL a WHERE clause is built with
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
                notes = utils.notFound(res);
            }
            utils.setResponseHeader(res);
            res.json(notes);
            next();
        })
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/note/{uuid}
     *
     * @description
     * Get a note by uuid. The uuid request must be in the URL.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested note or 404
     */
    server.get('api/note/:uuid', function (req, res, next) {
        var query = req.params.uuid;
        if (query === undefined) {
            var ret = utils.badRequest("A uuid key value is required to request a note");
            res = utils.setResponseHeader(res);
            res.statusCode = 400;
            res.json(ret);
            next();
        } else {
            logger.log('info', "Processing GET api/note/" + query);
            dStore.getNotes(dStore.SRC_UUID, query).then(function (notes) {
                if (notes === undefined || notes.length == 0) {
                    notes = utils.notFound(res);
                }
                res = utils.setResponseHeader(res);
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
        logger.log('info', "Processing GET api/routes");
        var ret = listAllRoutes(server);
        utils.setResponseHeader(res);
        res.json(ret);
        next();
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/users
     * get api/users?query=name
     *
     * @description
     * Get all users with optional query parameter. If query is in URL a WHERE clause is built with
     * that value. If the query is in the BODY it is taken literally without changes. Note that a BODY query is
     * a WHERE clause that must formatted as required by the Sequelize module,
     * see http://docs.sequelizejs.com/en/v3/docs/querying/#where. An empty query will return ALL records.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested users or 404
     */
    server.get('api/users', function (req, res, next) {
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
        logger.log('info', "Processing GET api/users");
        dStore.getUsers(src, query).then(function (users) {
            if (users == undefined || users.length == 0) {
                users = utils.notFound(res);
            }
            res = utils.setResponseHeader(res);
            res.json(users);
            next();
        })
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name get api/user/{uuid}
     *
     * @description
     * Get a user by uuid. The uuid request must be in the URL.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The requested user or 404
     */
    server.get('api/user/:uuid', function (req, res, next) {
        var query = req.params.uuid;
        if (query === undefined) {
            var ret = utils.badRequest("A uuid key value is required to request a user");
            res = utils.setResponseHeader(res);
            res.statusCode = 400;
            res.json(ret);
            next();
        } else {
            logger.log('info', "Processing GET api/user/" + query);
            dStore.getNotes(dStore.SRC_UUID, query).then(function (user) {
                if (user === undefined || user.length == 0) {
                    user = utils.notFound(res);
                }
                res = utils.setResponseHeader(res);
                res.json(user);
                next();
            });
        }
    });


    //=================================================================================================================
    // POST                                                                                                       POST
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name post api/note
     *
     * @description
     * Save a note. The note JSON is in body. A new uuid will be generated.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The new note, or 400 if the note could not be created.
     */
    server.post('api/note', function (req, res, next) {
        var note = undefined;
        var ret;

        logger.log('info', "Processing POST api/note");

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            note = req.body;
            note.uuid = utils.getUUID();
            ret = dStore.saveNote(note).then(function (fullNote) {
                    return fullNote;
                },
                function (xhrObj) {
                    var t = xhrObj.toString();
                    Error(utils.ReturnObject(201, "Created", "api/note failure: ", t));
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
     * @name post api/user
     *
     * @description
     * Save a user. The user JSON is in body. A new uuid will be generated.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The new user, or 400 if the user could not be created.
     */
    server.post('api/user', function (req, res, next) {
        var ret;
        var user = undefined;

        logger.log('info', "Processing POST api/user");

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            user = req.body;
            user.uuid = utils.getUUID();
            ret = dStore.saveUser(user).then(function (fullUser) {
                    return fullUser;
                },
                function (xhrObj) {
                    var t = xhrObj.toString();
                    Error(utils.ReturnObject(201, "Created", "api/user failure: ", t));
                }
            );
            res.statusCode = 201;
        }
        catch (e) {
            logger.log('error', e);
            ret = utils.badRequest(user);
        }
        utils.setResponseHeader(res);
        res.json(ret);
        next();
    });


    //=================================================================================================================
    // PUT                                                                                                          PUT
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name put api/note
     *
     * @description
     * Update a note. The note JSON is in body. The existing uuid is not changed.  If the uuid is
     * undefined or null a new uuid will be generated.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The updated note, or 400 if the note could not be created.
     */
    server.put('api/note', function (req, res, next) {
        var note = undefined;
        var ret;

        logger.log('info', "Processing PUT api/note");

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            note = req.body;
            if (note.uuid === undefined || note.uuid == null || note.uuid.length() < 1) {
                note.uuid = utils.getUUID();
            }
            ret = dStore.saveNote(note).then(function (fullNote) {
                    return fullNote;
                },
                function (xhrObj) {
                    var t = xhrObj.toString();
                    Error(utils.ReturnObject(201, "Update", "api/note failure: ", t));
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
     * @name put api/user
     *
     * @description
     * Update a user. The user JSON is in body. The existing uuid is not changed. If the uuid is
     * undefined or null a new uuid will be generated.
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  The updated user, or 400 if the user could not be created.
     */
    server.put('api/user', function (req, res, next) {
        var ret;
        var user = undefined;

        logger.log('info', "Processing PUT api/user");

        // Check the body for valid data
        try {
            // Handle the body coming in as a JSON object or string.
            user = req.body;
            if (user.uuid === undefined || user.uuid == null || user.uuid.length() < 1) {
                user.uuid = utils.getUUID();
            }
            ret = dStore.saveUser(user).then(function (fullUser) {
                    return fullUser;
                },
                function (xhrObj) {
                    var t = xhrObj.toString();
                    Error(utils.ReturnObject(201, "Update", "api/user failure: ", t));
                }
            );
            res.statusCode = 201;
        }
        catch (e) {
            logger.log('error', e);
            ret = utils.badRequest(user);
        }
        utils.setResponseHeader(res);
        res.json(ret);
        next();
    });

    //=================================================================================================================
    // DELETE                                                                                                    DELETE
    //

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name delete api/note/{uuid}
     *
     * @description
     * Delete a note by uuid
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  1 or 404
     */
    server.del('api/note/:id', function (req, res, next) {
        var ret = [];
        var uuid = req.params.uuid;
        if (uuid === undefined || uuid.length < 1) {
            ret = utils.badRequest("A uuid key value is required remove a note");
            utils.setResponseHeader(res);
            res.json(ret);
            next();
        } else {
            logger.log('info', "Processing DELETE api/note/:id" + uuid);
            dStore.deleteNote(uuid).then(function (count) {
                if (count === undefined || count < 1) {
                    ret = utils.notFound(res);
                } else {
                    ret = count;
                }
                utils.setResponseHeader(res);
                res.json(ret);
                next();
            });
        }
    });

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name delete api/user/{uuid}
     *
     * @description
     * Delete a user by uuid
     *
     * @param req   The Request
     * @param res   The Response
     * @param next  The Next route in the chain
     *
     * @returns  1 or 404
     */
    server.del('api/user/:id', function (req, res, next) {
        var ret = [];
        var uuid = req.params.uuid;
        if (uuid === undefined || uuid.length < 1) {
            ret = utils.badRequest("A uuid key value is required to remove a user");
            utils.setResponseHeader(res);
            res.json(ret);
            next();
        } else {
            logger.log('info', "Processing DELETE api/user/:id" + uuid);
            dStore.deleteUser(uuid).then(function (count) {
                if (count === undefined || count < 1) {
                    ret = utils.notFound(res);
                } else {
                    ret = count;
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

        // Have restify listen on the configured port
        // server.use("../www");
        server.listen(serverPort, function () {
            logger.log('info', '%s listening at %s', server.name, server.url);
        });

    }

    console.log("exiting");
})();
