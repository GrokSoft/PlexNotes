/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

/**
 * @name DatastoreJson
 *
 * @description A JSON datastore interface for PlexNotes.
 *
 * @type {{saveNotes, getNotes}}
 */
var DatastoreJson = (function () {
    var fs       = require('fs'); // The file system

    var dataFile = "notes-db.json"; // The file to save the plex data in

    var setDataFile = function(filename) {
        dataFile = filename;
    };

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
        setDataFile : setDataFile,
        saveNotes : saveNotes,
        getNotes : getNotes
    }
})();

exports.setDataFile = DatastoreJson.setDataFile();
exports.saveNotes = DatastoreJson.saveNotes();
exports.getNotes = DatastoreJson.getNotes();
