/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

/**
 * Utility functions
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
     * @name createRandomNote
     * @param count
     * @param dStore
     * @returns {{uuid: *, fk_categories_uuid: string, fk_priorities_uuid: string, fk_statuses_uuid: string, fk_users_uuid: string, fk_modifier_users_uuid: string, plex_server_uuid: string, created_date: *, modified_date: *, last_utc: *, title: string, details: string, opt_in: boolean}}
     */
    var createRandomNotes = function (count, dStore) {
        var cats = [];
        var pris = [];
        var stas = [];

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

                    for (var i = 0; i < count; ++i) {
                        var now = getNow();
                        var xc = parseInt(Math.random() * cats.length);
                        var xp = parseInt(Math.random() * pris.length);
                        var xs = parseInt(Math.random() * stas.length);

                        var note = {
                            uuid: getUUID(),
                            fk_categories_uuid: cats[xc],
                            fk_priorities_uuid: pris[xp],
                            fk_statuses_uuid: stas[xs],
                            fk_users_uuid: 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
                            fk_modifier_users_uuid: 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
                            plex_server_uuid: '955dec84-bea6-417f-98b6-dcf8308b002a',
                            created_date: now,
                            modified_date: now,
                            last_utc: now,
                            title: "Title for #" + i + " (randomly generated)",
                            details: loremIpsum(),
                            opt_in: Math.random() < .5
                        };

                        console.log(xc + " " + xp + " " + xs);
                    }
                });
            });
        });


        //console.log("createNote = " + JSON.stringify(note));
        return count;
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
        getNow: getNow,
        getUUID: getUUID,
        loremIpsum: loremIpsum,
        notFound: notFound,
        ReturnObject: ReturnObject,
        setResponseHeader: setResponseHeader
    };

}

exports.Utils = new Utils();                                    // singleton instance
