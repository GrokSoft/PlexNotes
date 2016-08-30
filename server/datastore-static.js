/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

/**
 * @name DatastoreStatic
 *
 * @description A datastore interface for PlexNotes containing static data.
 *
 * @type {{saveNotes, getNotes}}
 */
var DatastoreStatic = (function () {

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getAllNotes
     *
     * @description Returns an array of ALL notes records
     *
     * @returns {uuid, fk_category_uuid, fk_priority_uuid, fk_status_uuid, fk_user_uuid,
     *          fk_modified_user_uuid, server_uuid, created_date, modified_date, last_utc, opt_in, title, details}
     */
    var getAllNotes = function () {
        var notes = [
            {
                'uuid': '1e9ac7ad-c221-48b3-b99e-111778ba7511',
                'fk_category_uuid': 'de85a7a4-395f-41ad-ab45-31a47fa37c14',
                'fk_priority_uuid': 'd6b096bf-5b0e-4eaf-b25b-e42e10e75d84',
                'fk_status_uuid': '3d9c3886-ca2d-49c5-8490-f8d5d919e211',
                'fk_user_uuid': 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
                'fk_modified_user_uuid': 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
                'server_uuid': '33948bce-2a07-4aab-ab29-69cec4c72dc4',     // random
                'created_date': '1472526797',
                'modified_date': '1472526825',
                'last_utc': 1472526825,
                'opt_in': 1,
                "title": "Title for the first note",
                "details": "This is the first static note."
            },
            {
                "uuid": '20ef38ed-df3e-4095-aab6-5f0a39fa0375',
                'fk_category_uuid': 'd7e7bfdf-9651-47d6-b81f-6fa0210b79d8',
                'fk_priority_uuid': 'fae24113-356c-4954-947d-83716946292b',
                'fk_status_uuid': '93a30a13-140d-418a-8c71-f8c9a5c59628',
                'fk_user_uuid': '77dfcc17-9f4f-4bc9-a3a7-59d8a19b7781',
                'fk_modified_user_uuid': 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
                'server_uuid': '7c29fe13-cd4f-444a-8105-99708e80d013',     // random
                'created_date': '1472527280',
                'modified_date': '1472527288',
                'last_utc': 1472527288,
                'opt_in': 1,
                "title": "Title for the second note. This content is generated.",
                "details": loremIpsum()
            },
            {
                "uuid": '9ac88ff2-fd90-45b0-80de-31bf8cbee12c',
                'fk_category_uuid': 'fbd99efe-b7f8-476f-97f7-41936fc0b636',
                'fk_priority_uuid': '4928cde2-c372-42dd-b56c-b5152a814bb4',
                'fk_status_uuid': '7946f084-c489-4612-ac25-23dd9e40f336',
                'fk_user_uuid': 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
                'fk_modified_user_uuid': '77dfcc17-9f4f-4bc9-a3a7-59d8a19b7781',
                'server_uuid': '7c29fe13-cd4f-444a-8105-99708e80d013',     // random
                'created_date': '1472527523',
                'modified_date': '1472527531',
                'last_utc': 1472527531,
                'opt_in': 1,
                "title": "Title for the third note. This content is also generated.",
                "details": loremIpsum()
            }
        ];
        return notes;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getCategories
     *
     * @description Returns an array of categories records
     *
     * @returns {uuid, value, last_utc}
     */
    var getCategories = function () {
        var plexCategories = [
            {
                'uuid': 'be697ff3-2b1e-4189-b42c-f3ac51bf8b07',
                'value': "None",
                'last_utc': 1472522510
            },
            {
                'uuid': 'de85a7a4-395f-41ad-ab45-31a47fa37c14',
                'value': "See details",
                'last_utc': 1472520233
            },
            {
                'uuid': 'ea37de6a-5d7e-4418-bb0a-2eba5e352840',
                'value': "Missing Episode/Sequel",
                'last_utc': 1472522778
            },
            {
                'uuid': 'd7e7bfdf-9651-47d6-b81f-6fa0210b79d8',
                'value': "Needs Subtitles",
                'last_utc': 1472522799
            },
            {
                'uuid': '7c0fc735-1e7e-4f3f-b57b-3a8d2e47a14b',
                'value': "Needs Forced Subtitles",
                'last_utc': 1472522815
            },
            {
                'uuid': 'e068e721-3474-49e6-8e9a-036485ff238d',
                'value': "Error Streaming",
                'last_utc': 1472522830
            },
            {
                'uuid': '653c459f-97c7-4d50-9409-5eda117ba18b',
                'value': "Choppy Streaming",
                'last_utc': 1472522846
            },
            {
                'uuid': '7d96aa61-af22-4b93-baf9-cc2d28f1f8d3',
                'value': "Low Resolution",
                'last_utc': 1472522862
            },
            {
                'uuid': 'fbd99efe-b7f8-476f-97f7-41936fc0b636',
                'value': "Bad Audio",
                'last_utc': 1472522893
            },
            {
                'uuid': '13ae190e-4886-446b-b5c0-880b6af340a1',
                'value': "Low Audio",
                'last_utc': 1472522934
            },
            {
                'uuid': 'c9d9b026-64b8-469b-a362-d82a281d16a0',
                'value': "High Audio",
                'last_utc': 1472522952
            },
            {
                'uuid': 'c782b3dc-a8b9-4b1a-bbca-aae1ab0b7723',
                'value': "Add Artwork",
                'last_utc': 1472522973
            }
        ];
        return plexCategories;
    }

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getPriorities
     *
     * @description Returns an array of priorities records
     *
     * @returns {uuid, value, last_utc}
     */
    var getPriorities = function () {
        var plexPriorities = [
            {
                'uuid': '4928cde2-c372-42dd-b56c-b5152a814bb4',
                'value': "Low",
                'last_utc': 1472525608
            },
            {
                'uuid': 'd6b096bf-5b0e-4eaf-b25b-e42e10e75d84',
                'value': "Normal",
                'last_utc': 1472525645
            },
            {
                'uuid': '16e106f1-0766-47df-b08e-d6c0fc5d91c3',
                'value': "High",
                'last_utc': 1472525683
            },
            {
                'uuid': 'fae24113-356c-4954-947d-83716946292b',
                'value': "Critical",
                'last_utc': 1472525722
            }
        ];
        return plexPriorities;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getStatuses
     *
     * @description Returns an array of status records
     *
     * @returns {uuid, value, last_utc}
     */
    var getStatuses = function () {
        var plexStatuses = [
            {
                'uuid': '3d9c3886-ca2d-49c5-8490-f8d5d919e211',
                'value': "New",
                'last_utc': 1472521553
            },
            {
                'uuid': '8f6e8a32-6421-43d6-9165-c18ccb8d4e7a',
                'value': "Open",
                'last_utc': 1472521634
            },
            {
                'uuid': '93a30a13-140d-418a-8c71-f8c9a5c59628',
                'value': "Active",
                'last_utc': 1472521795
            },
            {
                'uuid': 'd9814799-1471-4392-bead-92117c464835',
                'value': "Duplicate",
                'last_utc': 1472522152
            },
            {
                'uuid': '7946f084-c489-4612-ac25-23dd9e40f336',
                'value': "Will not fix",
                'last_utc': 1472522163
            },
            {
                'uuid': '5daa0c72-85c3-49a4-bf26-1eb2985ce0a8',
                'value': "Closed",
                'last_utc': 1472522171
            }
        ];
        return plexStatuses;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getUsers
     *
     * @description Returns an array of users records
     *
     * @returns {uuid, value, last_utc}
     */
    var getUsers = function () {
        var plexUsers = [
            {
                'uuid': 'ef97cacf-f75e-4b22-9a7b-ad3d2ed95ec3',
                'friendly_name': "Bill Gray",
                'email': "bill@groksoft.net",
                'opt_in': 1,
                'last_utc': 1472524680
            },
            {
                'uuid': '77dfcc17-9f4f-4bc9-a3a7-59d8a19b7781',
                'friendly_name': "Todd Hill",
                'email': "todd@groksoft.net",
                'opt_in': 0,
                'last_utc': 1472524768
            }
        ];
        return plexUsers;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name createRandomNote
     *
     * @description
     * Create a note with random data and noteTypes.
     */
    var createRandomNote = function () {
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
    var loremIpsum = function (start, len) {
        var MIN = 10;
        /** The minimum number of characters to return. */
        var loremIpsumTxt = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?";

        if (start == undefined)
            start = Math.random() * loremIpsumTxt.length - MIN;
        if (len == undefined)
            len = Math.max(start - 1, parseInt(Math.random() * loremIpsumTxt.length - MIN));

        return loremIpsumTxt.substr(start, len);
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name saveNotes
     *
     * @description
     * Save the notes to a file
     */
    var saveNotes = function () {
        fs.writeFile(dataFile, JSON.stringify(plexData, null, 4), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved with %d notes.", plexData.length);
        });
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getNotes
     *
     * @description
     * Get the notes from the file.
     */
    var getNotes = function () {
        fs.exists(dataFile, function (exists) {
            if (exists) {
                fs.readFile(dataFile, function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    // ?????????????????????????????????????????????????????? plexData = JSON.parse(data);

                    /**
                     * Find the last id used so it can be incremented for a new note.
                     */
                    // If the file can not be manually edited we can get the largest id with the following
                    // idLast = notes[notes.length-1].id;
                    //console.log("idLast = " + idLast);
                    // Iterate through the notes to find the largest ID number in case it was manually edited.
                    //                   plexData.forEach(function (node) {
                    //                       //console.log("idLast = %s note.id = %s", idLast, node.id);
                    //                       var idLast = 0;   // ???????????????????              parseInt(Math.max(idLast, parseInt(node.id)));
                    //                   });
                    //console.log("idLast = " + idLast);
                    console.log("There are %d notes available.", plexData.length);
                });
            }
            else {
                console.log("No Data file - using the default data");
            }
        });
    };


    // ----------------------------------------------------------------------------------------------------------------
    // exports
    return {
        getAllNotes: getAllNotes,
        getCategories: getCategories,
        getPriorities: getPriorities,
        getStatuses: getStatuses,
        getUsers: getUsers,
        saveNotes: saveNotes,
        getNotes: getNotes
    };
})();

exports.getAllNotes = DatastoreStatic.getAllNotes();
exports.getCategories = DatastoreStatic.getCategories();
exports.getPriorities = DatastoreStatic.getPriorities();
exports.getStatuses = DatastoreStatic.getStatuses();
exports.getUsers = DatastoreStatic.getUsers();
exports.saveNotes = DatastoreStatic.saveNotes();
exports.getNotes = DatastoreStatic.getNotes();
