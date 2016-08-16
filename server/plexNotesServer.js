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
 *
 */
'use strict';

/**
 * PlexNotes REST Server
 */
(function () {

    var restify = require('restify');

    /**
     * Respond with name passed and parameter
     * @param req
     * @param res
     * @param next
     */
    function respond(req, res, next) {
       var param = req.query.whatever;

        res.send('hello ' + req.params.name + ' it works! (' + param + ')\n\n');
        next();
    }

    var server = restify.createServer({name: 'PlexNotes Server'});

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

    /**
     * REST End points
     */
    server.get('/hello/:name', respond);
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


    /**
     * Have restify listen on the configured port.
     */
    server.listen(8080, function () {
        console.log('%s listening at %s', server.name, server.url);
    });


})();