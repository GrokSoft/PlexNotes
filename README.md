# ![alt text][plexLg]Notes

### The ![alt text][plexSm]Notes Project

Created August 14, 2016

*Please note the UI is not designed yet. It consists of several components that are being developed and tested.*

The goal of the project is to have a way for family and friends that use my ![alt text][plexVs] media server to report any issues with the content. Request new content, Recommend content to other users, etc...

This project consists of a REST server and client developed in JavaScript with:

* Client-side:
    - AngularJS
    - UI-Bootstrap

* Server-side:
    - node.js
    - restify
    - sequelize
    - winston

* A list of available route paths can be found using the uri: `api/routes`
    ~~~~
    {
        "GET": [
		"/www\\/?.*/",
		"api/data/categories",
		"api/data/priorities",
		"api/data/statuses",
		"api/notes",
		"api/note/:uuid",
		"api/routes",
		"api/users",
		"api/user/:uuid"
        ],
        "POST": [
            "api/note",
            "api/user"
        ],
        "PUT": [
            "api/note",
            "api/user"
        ],
        "DELETE": [
            "api/note/:id",
            "api/user/:id"
        ]
    }`
    ~~~~

* The server can be found under the `/server` directory.
  * To run the server use: `node plexNotesServer.js` while in the server folder.
  
* The client can be found under the `/www` directory.
  * To run the client load the `index.html` page with a web browser while in the www folder.
  
  ###### _Note: If you get a cross domain error when loading the client, you will need to serve the page with a web server, such as the one built into IntelliJ. The reason for this is when the page is loaded though a file:// url some browsers will throw a cross domain exception when the page uses http:// for the REST calls._
        

## Development notes

You must run the web app on the same port as the server is running.
Note that in IntelliJ, when a run configuration is created, by default the port is for the intelliJ web server. Right now PlexNotes is meant to be ran on the same server as the data server!
This may change in the future to have a configurable url.

<br/>
<br/>

----
Although ![alt text][plexVs]Notes is designed specifically for ![alt text][plexVs] Media Server(s) the
![alt text][plexVs]Notes project is not affiliated with ![alt text][plexVs] Inc. 

All trademarks and copyrights are the property of their respective owners.

For more information on ![alt text][plexVs] go to the [offical Plex web site](https://www.plex.tv/).

[plexLg]: http://groksoft.net/plex/_images/Plex-h2.png
[plexSm]: http://groksoft.net/plex/_images/PLEX-vsmall.png
[plexVs]: http://groksoft.net/plex/_images/PLEX-tiny.png
