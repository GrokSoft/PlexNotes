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