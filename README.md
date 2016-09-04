# ![alt text][plexLg]Notes

### The ![alt text][plexSm]Notes Project

Created August 14, 2016

This project consists of a REST server developed with JavaScript, node and restify. And a REST client developed with AngularJS & Bootstrap.

*Please note the UI is not designed yet. It consists of several components that are being developed and tested.*

The goal of the project is to have a way for family and friends that use my ![alt text][plexVs] media server to report any issues with the content. Request new content, etc...

* A list of available route paths can be found using the uri: `api/routes`
    ~~~~
    {
        "GET": [
            "/www\\/?.*/",
            "api/data/priorities",
            "api/data/statuses",
            "api/data/categories",
            "api/routes",
            "api/notes",
            "api/notes/:id"
        ],
        "PUT": [],
        "POST": [
            "api/notes",
            "api/data/add/:count"
        ],
        "DELETE": [
            "api/notes/:id"
        ]
    }`
    ~~~~

* The server can be found under the `/server` directory.
* The client can be found under the `/www` directory.

## Development notes

You must run the web app on the same port as the server is running.
Note that in IntelliJ, when a run configuration is created, by default the port is for the intelliJ web server. Right now PlexNotes is meant to be ran on the same server as the data server!!!!
This may change in the future to have a configurable url.

<br/>
<br/>
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
