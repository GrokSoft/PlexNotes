/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

/**
 * Utilities
 *
 * @returns {{badRequest: badRequest, createRandomNotes: createRandomNotes, getNow: getNow, getUUID: getUUID, loremIpsum: loremIpsum, notFound: notFound, ReturnObject: ReturnObject, setResponseHeader: setResponseHeader}}
 * @constructor
 */
function Utils() {

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

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name createRandomNotes
     *
     * @description Generate any number of random notes for testing.
     *
     * @param count
     * @param dStore
     * @returns cnt
     */
    var createRandomNotes = function (count, dStore) {
        var cats = [];
        var pris = [];
        var stas = [];
        var usrs = [];
        var svrs = ['802221a5-1383-4ea4-b60e-1b5838a546e9', 'c90a407a-c12b-4046-a5c2-9bdeacef8036'];
        var cnt = 0;


        cats = dStore.getCategories().then(function (cats) {
            if (cats === undefined || cats.length == 0) {
                return 0;
            }

            pris = dStore.getPriorities().then(function (pris) {
                if (pris === undefined || pris.length == 0) {
                    return 0;
                }

                stas = dStore.getStatuses().then(function (stas) {
                    if (stas === undefined || stas.length == 0) {
                        return 0;
                    }

                    usrs = dStore.getUsers().then(function (usrs) {
                        if (usrs === undefined || usrs.length == 0) {
                            usrs = createTestUsers(dStore);                    // generate fake test users
                        }

                        for (var i = 0; i < count; ++i) {
                            var now = getNow();
                            var xc = parseInt(Math.random() * cats.length);
                            var xp = parseInt(Math.random() * pris.length);
                            var xs = parseInt(Math.random() * stas.length);
                            var xu = parseInt(Math.random() * usrs.length);
                            var xv = parseInt(Math.random() * svrs.length);

                            var note = {
                                uuid: getUUID(),
                                fk_categories_uuid: cats[xc].uuid,
                                fk_priorities_uuid: pris[xp].uuid,
                                fk_statuses_uuid: stas[xs].uuid,
                                fk_users_uuid: usrs[xu].uuid,
                                fk_modifier_users_uuid: usrs[xu].uuid,
                                plex_server_uuid: svrs[xv],
                                created_date: now,
                                modified_date: now,
                                last_utc: now,
                                title: "Title for #" + i + " (randomly generated)",
                                details: loremIpsum(),
                                opt_in: Math.round(Math.random() < .5)
                            };


                            note = dStore.saveNote(note).then(function (fullNote) {
                                    if (fullNote === undefined || fullNote.length == 0) {
                                        return null;
                                    }
                                    ++cnt;
                                },
                                function (xhrObj) {
                                    var t = xhrObj.toString();
                                    Error(utils.ReturnObject(201, "Poar", "createRandomNotes failure: ", t));
                                }
                            );


                            console.log(xc + " " + xp + " " + xs + " " + xu + " " + xv);
                        }
                    }, function (xhrObj) {
                            var t = xhrObj.toString();
                            Error("createRandomNotes failure 4: " + t);
                        }
                    );
                }, function (xhrObj) {
                        var t = xhrObj.toString();
                        Error("createRandomNotes failure 3: " + t);
                    }
                );
            }, function (xhrObj) {
                    var t = xhrObj.toString();
                    Error("createRandomNotes failure 2: " + t);
                }
            );
        }, function (xhrObj) {
                var t = xhrObj.toString();
                Error("createRandomNotes failure 1: " + t);
            }
        );

        return cnt;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name create several test users
     *
     * @description
     * For createRandomNotes() when generating test data in an empty database.  Creates fake users in the datastore.
     *
     * @param dStore
     */
    var createTestUsers = function (dStore) {

        // make a user
        var u = {
            uuid: 'f430cdbb-f55b-435a-9818-04bd0c8d82d5',
            plex_user_id: '4b0d3c02-69cf-4df7-9b1d-4c837ab2629b',
            last_utc: getNow(),
            friendly_name: 'Bill Gray',
            email: 'bill@somewhere.com',
            opt_in: 1,
            role: 'Administrator'
        };
        var ret = dStore.saveUser(u).then(function (fullUser) {

                // make a user
                var u = {
                    uuid: '7194caf4-8735-4a9e-8554-6a704bf97b48',
                    plex_user_id: '4ce92bc6-7464-4c31-8f74-1a00b194df11',
                    last_utc: getNow(),
                    friendly_name: 'Todd Hill',
                    email: 'todd@somewhere.com',
                    opt_in: 1,
                    role: 'Administrator'
                };
                var ret = dStore.saveUser(u).then(function (fullUser) {

                        // make a user
                        var u = {
                            uuid: '9f1ecfcc-c751-4050-a4a3-a47a1c62cd27',
                            plex_user_id: '87d489ea-f5d7-44d7-99c4-3a183c9cac47',
                            last_utc: getNow(),
                            friendly_name: 'Suzy User',
                            email: 'suzy@somewhere.com',
                            opt_in: 0,
                            role: 'User'
                        };
                        var ret = dStore.saveUser(u).then(function (fullUser) {

                                // make a user
                                var u = {
                                    uuid: '9f0305c7-0d40-480e-bdc5-813c6febb5e2',
                                    plex_user_id: 'd380a0fb-736d-412e-b440-2decb8a26865',
                                    last_utc: getNow(),
                                    friendly_name: 'John Doe',
                                    email: 'john@somewhere.com',
                                    opt_in: 1,
                                    role: 'User'
                                };
                                var ret = dStore.saveUser(u).then(function (fullUser) {

                                        // return the new users from the datastore
                                        var usrs = dStore.getUsers().then(function (usrs) {
                                            if (usrs === undefined || usrs.length == 0) {
                                                return null;
                                            }
                                            return usrs;
                                        },
                                            function (xhrObj) {
                                                var t = xhrObj.toString();
                                                Error(utils.ReturnObject(201, "Get", "createTestUsers failure: ", t));
                                            }
                                        );

                                    },
                                    function (xhrObj) {
                                        var t = xhrObj.toString();
                                        Error(utils.ReturnObject(201, "Create", "acreateTestUsers failure: ", t));
                                    }
                                );

                            },
                            function (xhrObj) {
                                var t = xhrObj.toString();
                                Error(utils.ReturnObject(201, "Create", "createTestUsers failure: ", t));
                            }
                        );

                    },
                    function (xhrObj) {
                        var t = xhrObj.toString();
                        Error(utils.ReturnObject(201, "Create", "createTestUsers failure: ", t));
                    }
                );

            },
            function (xhrObj) {
                var t = xhrObj.toString();
                Error(utils.ReturnObject(201, "Create", "createTestUsersfailure: ", t));
            }
        );

    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getNow
     *
     * @description PlexNotes method for the time in seconds
     *
     * @returns {number}
     */
    var getNow = function () {
        var now = Date.now() / 1000;
        now = parseInt(now);
        return now;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getUUID
     *
     * @description PlexNotes method for a new UUID
     *
     * @returns {uuid}
     */
    var getUUID = function () {
        var mod_uuid = require('uuid');
        var uid = mod_uuid.v4();
        //console.log("getUUID: " + uid);
        return uid;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name loremIpsum
     *
     * @description
     * Get Lorem Ipsum text.
     * If start and/or end are not passed they will be randomly generated.
     *
     * NOTE: This function must come before the plexData object that is instantiated below
     *
     * @param start
     * @param len
     * @returns {string}
     */
    var loremIpsum = function (start, len) {
        var MIN = 10;
        /** The minimum number of characters to return. */
        var loremIpsumTxt = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

        if (start == undefined) {
            start = Math.random() * loremIpsumTxt.length - MIN;
        }
        if (len == undefined) {
            len = Math.max(start - 1, parseInt(Math.random() * loremIpsumTxt.length - MIN));
        }
        return loremIpsumTxt.substr(start, len);
    };

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name notFound
     *
     * @description
     * Load the passed response with a 404 Not Found error and return the error text
     *
     * @param res  The response to modify
     * @returns {} Note NOT found
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

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name ReturnObject
     *
     * @description Create a PlexNotes standard object to be returned to the client
     *
     * @param statusCode
     * @param statusText
     * @param message
     * @param info
     *
     * @returns {{jse_shortmsg: (*|string), jse_info: (*|{}), message: (*|string), statusCode: *, body: {code: *, message: (*|string)}, restCode: *}}
     */
    var ReturnObject = function (statusCode, statusText, message, info) {
        var retJson = {
            "jse_shortmsg": message || "",
            "jse_info": info || {},
            "message": message || "",
            "statusCode": statusCode,
            "body": {
                "code": statusText,
                "message": message || ""
            },
            "restCode": statusText
        };
        return retJson;
    };

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
        return res;
    };

    // ----------------------------------------------------------------------------------------------------------------
    // exports
    return {
        badRequest: badRequest,
        createRandomNotes: createRandomNotes,
        createTestUsers: createTestUsers,
        getNow: getNow,
        getUUID: getUUID,
        loremIpsum: loremIpsum,
        notFound: notFound,
        ReturnObject: ReturnObject,
        setResponseHeader: setResponseHeader
    };

}

exports.Utils = new Utils();                                    // singleton instance
