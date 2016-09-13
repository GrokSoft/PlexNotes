/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

// ----------------------------------------------------------------------------------------------------------------

exports.getNow = function () {
    var now = Date.now() / 1000;
    now = now.toFixed();
    return now;
};

// ----------------------------------------------------------------------------------------------------------------

exports.getUUID = function () {
    var mod_uuid = require('uuid');
    var uid = mod_uuid.v4();
    //console.log("getUUID: " + uid);
    return uid;
};

// ----------------------------------------------------------------------------------------------------------------
/**
 * @name createRandomNote
 *
 * @description
 * Create a note with random data and noteTypes.
 */
exports.createRandomNote = function () {
    var noteCnt;
    var noteNum;
    var users = ["Bill", "Todd", "Sarah", "Reid", "Erin", "Ellissa"];
    var note = {
        "id": 0,
        "title": "",
        "user": "",
        "emailme": false,
        "priority": 0,
        "status": 0,
        "details": loremIpsum(),
        "issues": []
    };

    //console.log("idLast " + idLast);
    note.id = ++idLast;
    note.title = "Title for #" + note.id + " (Random generated)";
    note.user = users[parseInt(Math.random() * users.length)];
    note.emailme = Math.random() < .5;
    note.priority = parseInt(Math.random() * plexPriorites.length);
    //console.log("note.priority " + note.priority);
    note.status = parseInt(Math.random() * plexStatuses.length);
    note.details = loremIpsum();

    // Ensure we have at least 1 issueType.
    noteCnt = Math.max(1, parseInt(Math.random() * plexIssues.length));
    //console.log("noteCnt " + noteCnt);
    for (var j = 0; j < noteCnt; j++) {
        for (var k = 0; k < noteCnt; k++) {
            noteNum = parseInt(Math.random() * plexNotes.length);
            var isUsed = note.issues.find(function (node) {
                //console.log("node " + node);
                return node == noteNum;
            });
            //console.log("isUsed " + isUsed);
            if (isUsed == undefined) {
                //console.log("noteNum" + noteNum);
                note.issues.push(noteNum);
                break;
            }
        }
    }
    console.log("createNote = " + JSON.stringify(note));
    return note;
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
exports.loremIpsum = function (start, len) {
    var MIN = 10;
    /** The minimum number of characters to return. */
    var loremIpsumTxt = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

    if (start == undefined)
        start = Math.random() * loremIpsumTxt.length - MIN;
    if (len == undefined)
        len = Math.max(start - 1, parseInt(Math.random() * loremIpsumTxt.length - MIN));

    return loremIpsumTxt.substr(start, len);
};

