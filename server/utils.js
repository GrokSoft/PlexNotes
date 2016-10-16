/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

function Utils() {

    //-----------------------------------------------------------------------------------------------------------------
    /**
     * @name badRequest
     *
     * @description
     * Return a json error showing a bad request
     *
     * @param body
     *
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
     * @name getNow
     *
     * @description
     * PlexNotes method for the Epoch time in seconds
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
     * @description
     * PlexNotes method for a new UUID
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
     *
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
     *
     * @returns {*} Item NOT found
     */
    var notFound = function (res) {
        res.statusCode = 404;
        var retJson = {
            "jse_shortmsg": "Item not found",
            "jse_info": {},
            "message": "Requested item was not found",
            "statusCode": 404,
            "body": {
                "code": "NotFound",
                "message": "Item was not found"
            },
            "restCode": "NotFound"
        };
        return retJson;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name ReturnObject
     *
     * @description
     * Create a PlexNotes standard object to be returned to the client
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
     *
     * @return {*}
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
        getNow: getNow,
        getUUID: getUUID,
        loremIpsum: loremIpsum,
        notFound: notFound,
        ReturnObject: ReturnObject,
        setResponseHeader: setResponseHeader
    };

}

exports.Utils = new Utils();                                    // singleton instance
