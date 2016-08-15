/**
 * Created by trh on 8/13/16.
 *
 * Test with:
 *      curl -is http://localhost:8080/hello/mark -H 'accept: text/plain'
 *      curl -is http://localhost:8080/hello/mark
 *      curl -is http://localhost:8080/hello/mark -X HEAD -H 'connection: close'
 */

var restify = require('restify');

function respond(req, res, next) {
   res.send('hello ' + req.params.name + ' it works!' + '\n\n');
   next();
}

var server = restify.createServer({name: 'PlexNotes Server'});
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
   console.log('%s listening at %s', server.name, server.url);
});