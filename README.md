# ![alt text][plexLg]Notes

## The PlexNotes Project

Created 8/14/16

This project consists of a REST server developed with JavaScript, node and restify. And a REST client developed with AngularJS & Bootstrap.

*Please note the UI is not designed yet. It consists of several components that are being developed and tested.*

The goal of the project is to have a way for family and friends that use my ![alt text][plexVs] media server to report any issues with the content. Request new content, etc...

* A list of available route paths can be found using the url: `api/routes`
    ~~~~
    {
        "GET": [
            "/www\\/?.*/",
            "api/data/priorities",
            "api/data/statuses",
            "api/data/issuetypes",
            "api/routes",
            "api/issues",
            "api/issues/:id"
        ],
        "PUT": [],
        "POST": [
            "api/issues",
            "api/data/add/:count"
        ],
        "DELETE": []
    }`
    ~~~~

* The server can be found under the `/server` directory.
* The client can be found under the `/www` directory.

## Development notes

You must run the web app on the same port as the server is running.
Note that in IntelliJ, when a run configuration is created, by default the port is for the intelliJ web server. Right now PlexNotes is meant to be ran on the same server as the data server!!!!
This may change in the future to have a configurable url

[plexLg]: http://groksoft.net/plex/_images/PLEX-sm.png
[plexSm]: http://groksoft.net/plex/_images/PLEX-vsmall.png
[plexVs]: http://groksoft.net/plex/_images/PLEX-tiny.png