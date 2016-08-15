/**
 * Created by Bill on 8/14/2016.
 */
/**
 * Created by trh on 8/13/16.
 *
 * Test with:
 *      curl -is http://localhost:8080/hello/mark -H 'accept: text/plain'
 *      curl -is http://localhost:8080/hello/mark
 *      curl -is http://localhost:8080/hello/mark -X HEAD -H 'connection: close'
 *
 *      curl -is http://localhost:8080/confirm/bill -H 'accept: text/plain'
 *      curl -is http://localhost:8080/confirm/john
 *      curl -is http://localhost:8080/confirm/chewbaca -X HEAD -H 'connection: close'
 */

var restify = require('restify');

function respondConfirm(req, res, next) {
   res.send('confirm ' + req.params.name + ' it works!' + '\n\n');
   next();
}

function respond(req, res, next) {
   res.send('hello ' + req.params.name + ' it works!' + '\n\n');
   next();
}

var server = restify.createServer();
server.get('/hello/:name', respond);
server.head('/hello/:name', respond);
server.get('/confirm/:name', respondConfirm);

server.listen(8080, function() {
   console.log('%s listening at %s', server.name, server.url);
});
