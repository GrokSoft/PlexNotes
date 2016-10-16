/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';


function Datastore() {
    var Sequelize = require('sequelize');                       // datastore ORM
    var utils = require('./utils.js').Utils;                    // server utilities
    var wait = require('wait-promise');

    var SRC_UNDEFINED = 0;
    var SRC_URL = 1;
    var SRC_BODY = 2;
    var SRC_UUID = 3;

    var Categories;
    var Notes;
    var Priorities;
    var Statuses;
    var Users;

    var dbHost = 'localhost';
    var dbName = undefined;
    var dbPoolMax = 5;
    var dbPoolIdle = 10000;
    var dbDialect = undefined;
    var sqlDb = undefined;
    var logger = undefined;

    var generateFlag = false;                                   // generate done flag
    var initializedFlag = false;
    var tmpUsers = [];                                           // temporary users

    var proms = [];

    // ----------------------------------------------------------------------------------------------------------------
    // init
    /**
     * @name init
     *
     * @description
     * Initialize the PlexNotes database interface. The database and tables will be created if they
     * do not exist. If created certain tables are pre-populated with basic data.
     *
     */
    var init = function (aDbType, aDbName, aLogger) {
        dbName = aDbName;
        logger = aLogger;
        // Setup the datastore interface
        // if (aDbType == 0) {
        //     dbDialect = 'static';
        //     sqlDb = dsStatic;
        //     logger.log('info', 'dbType set: static');
        //
        // } else if (aDbType == 1) {
        //     dbDialect = 'json';
        //     sqlDb = require('./datastore-json.js');
        //     sqlDb.setDataFile(aDbName);
        //     logger.log('info', 'dbType set: JSON');
        //
        // } else if (aDbType == 2) {
        dbDialect = 'sqlite';
        sqlDb = new Sequelize(dbName, 'plexnotes', 'plexnotes', {
            host: dbHost,
            dialect: dbDialect,
            define: {
                timestamps: false                           // PlexNotes manages stamps
            },
            pool: {
                max: dbPoolMax,
                min: 0,
                idle: dbPoolIdle
            },
            storage: getDbPath(dbName)
        });
        // logger.log('info', 'dbType set: SQLite');
        // } else {
        //     console.log("\n\nFATAL: dbType not defined or not found, cannot continue.\n\n");
        //     return false;
        // }
        logger.log('info', 'dbDialect: ' + dbDialect + ', dbName: ' + dbName);


        //-----------------------------------------------------------------------------------------------------------------
        // data models - http://docs.sequelizejs.com/en/latest/docs/models-definition/
        //

        //-------------------------------------------------------------------------------------------- Categories ---------
        Categories = sqlDb.define('categories', {
            uuid: {
                type: Sequelize.STRING(36),
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            value: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Categories.removeAttribute('id');

        //-------------------------------------------------------------------------------------------- Priorities ---------
        Priorities = sqlDb.define('priorities', {
            uuid: {
                type: Sequelize.STRING(36),
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            value: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Priorities.removeAttribute('id');

        //-------------------------------------------------------------------------------------------- Statuses -----------
        Statuses = sqlDb.define('statuses', {
            uuid: {
                type: Sequelize.STRING(36),
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            value: {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Statuses.removeAttribute('id');

        //-------------------------------------------------------------------------------------------- Users --------------
        Users = sqlDb.define('users', {
            uuid: {
                type: Sequelize.STRING(36),
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            plex_user_uuid: {
                type: Sequelize.STRING(36)
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            friendly_name: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            role: {
                type: Sequelize.STRING
            },
            opt_in: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Users.removeAttribute('id');

        //-------------------------------------------------------------------------------------------- Notes --------------
        // Notes must be last so references: are valid
        Notes = sqlDb.define('notes', {
            uuid: {
                type: Sequelize.STRING(36),
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            fk_categories_uuid: {
                type: Sequelize.STRING(36),
                references: {
                    model: Categories,
                    key: 'uuid'
                }
            },
            fk_priorities_uuid: {
                type: Sequelize.STRING(36),
                references: {
                    model: Priorities,
                    key: 'uuid'
                }
            },
            fk_statuses_uuid: {
                type: Sequelize.STRING(36),
                references: {
                    model: Statuses,
                    key: 'uuid'
                }
            },
            fk_users_uuid: {
                type: Sequelize.STRING(36),
                references: {
                    model: Users,
                    key: 'uuid'
                }
            },
            fk_modifier_users_uuid: {
                type: Sequelize.STRING(36)
            },
            plex_server_uuid: {
                type: Sequelize.STRING(36)
            },
            created_date: {
                type: Sequelize.INTEGER
            },
            modified_date: {
                type: Sequelize.INTEGER
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING
            },
            details: {
                type: Sequelize.TEXT
            },
            opt_in: {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Notes.removeAttribute('id');


        proms.push(Categories.sync().then(function () {
            proms.push(Categories.count().then(function (catsCount) {

                proms.push(Priorities.sync().then(function () {
                    proms.push(Priorities.count().then(function (priCount) {

                        proms.push(Statuses.sync().then(function () {
                            proms.push(Statuses.count().then(function (statCount) {

                                proms.push(Users.sync().then(function () {

                                    proms.push(Notes.sync().then(function () {

                                        if (catsCount < 1) {
                                            proms.push(Categories.create({
                                                uuid: 'be697ff3-2b1e-4189-b42c-f3ac51bf8b07',
                                                last_utc: 1472522510,
                                                value: "None"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: 'de85a7a4-395f-41ad-ab45-31a47fa37c14',
                                                last_utc: 1472520233,
                                                value: "See details"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: 'ea37de6a-5d7e-4418-bb0a-2eba5e352840',
                                                value: "Missing Episode/Sequel",
                                                last_utc: 1472522778
                                            }));
                                            proms.push(Categories.create({
                                                uuid: 'd7e7bfdf-9651-47d6-b81f-6fa0210b79d8',
                                                last_utc: 1472522799,
                                                value: "Needs Subtitles"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: '7c0fc735-1e7e-4f3f-b57b-3a8d2e47a14b',
                                                last_utc: 1472522815,
                                                value: "Needs Forced Subtitles"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: 'e068e721-3474-49e6-8e9a-036485ff238d',
                                                last_utc: 1472522830,
                                                value: "Error Streaming"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: '653c459f-97c7-4d50-9409-5eda117ba18b',
                                                last_utc: 1472522846,
                                                value: "Choppy Streaming"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: '7d96aa61-af22-4b93-baf9-cc2d28f1f8d3',
                                                last_utc: 1472522862,
                                                value: "Low Resolution"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: 'fbd99efe-b7f8-476f-97f7-41936fc0b636',
                                                last_utc: 1472522893,
                                                value: "Bad Audio"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: '13ae190e-4886-446b-b5c0-880b6af340a1',
                                                last_utc: 1472522934,
                                                value: "Low Audio"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: 'c9d9b026-64b8-469b-a362-d82a281d16a0',
                                                last_utc: 1472522952,
                                                value: "High Audio"
                                            }));
                                            proms.push(Categories.create({
                                                uuid: 'c782b3dc-a8b9-4b1a-bbca-aae1ab0b7723',
                                                last_utc: 1472522973,
                                                value: "Add Artwork"
                                            }));
                                        }

                                        // ##########################
                                        if (priCount < 1) {
                                            proms.push(Priorities.create({
                                                'uuid': '4928cde2-c372-42dd-b56c-b5152a814bb4',
                                                'last_utc': 1472525608,
                                                'value': "Low"
                                            }));
                                            proms.push(Priorities.create({
                                                'uuid': 'd6b096bf-5b0e-4eaf-b25b-e42e10e75d84',
                                                'last_utc': 1472525645,
                                                'value': "Normal"
                                            }));
                                            proms.push(Priorities.create({
                                                'uuid': '16e106f1-0766-47df-b08e-d6c0fc5d91c3',
                                                'last_utc': 1472525683,
                                                'value': "High"
                                            }));
                                            proms.push(Priorities.create({
                                                'uuid': 'fae24113-356c-4954-947d-83716946292b',
                                                'last_utc': 1472525722,
                                                'value': "Critical"
                                            }));
                                        }

                                        // ########################
                                        if (statCount < 1) {
                                            proms.push(Statuses.create({
                                                'uuid': '3d9c3886-ca2d-49c5-8490-f8d5d919e211',
                                                'value': "New",
                                                'last_utc': 1472521553
                                            }));
                                            proms.push(Statuses.create({
                                                'uuid': '8f6e8a32-6421-43d6-9165-c18ccb8d4e7a',
                                                'value': "Open",
                                                'last_utc': 1472521634
                                            }));
                                            proms.push(Statuses.create({
                                                'uuid': '93a30a13-140d-418a-8c71-f8c9a5c59628',
                                                'value': "Active",
                                                'last_utc': 1472521795
                                            }));
                                            proms.push(Statuses.create({
                                                'uuid': '82ae28a1-f981-43ac-b3bd-74b4d24789d3',
                                                'value': "On hold",
                                                'last_utc': 1472521835
                                            }));
                                            proms.push(Statuses.create({
                                                'uuid': 'd9814799-1471-4392-bead-92117c464835',
                                                'value': "Duplicate",
                                                'last_utc': 1472522152
                                            }));
                                            proms.push(Statuses.create({
                                                'uuid': '7946f084-c489-4612-ac25-23dd9e40f336',
                                                'value': "Will not fix",
                                                'last_utc': 1472522163
                                            }));
                                            proms.push(Statuses.create({
                                                'uuid': '5daa0c72-85c3-49a4-bf26-1eb2985ce0a8',
                                                'value': "Closed",
                                                'last_utc': 1472522171
                                            }));
                                        }

                                        sqlDb.Promise.all(proms).then(function() {
                                            setInitializedFlag(true);
                                        });

                                    }));
                                }));
                            }));
                        }));
                    }));
                }));
            }));
        }));

        return proms[0];
    }; // init

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name deleteNote
     *
     * @description
     * Deletes a note
     *
     * @param theUuid
     *
     * @returns {*}
     */
    var deleteNote = function (theUuid) {
        var prom;
        var clause = {
            where: {
                uuid: theUuid
            }
        };
        prom = Notes.destroy(clause).then(function (count) {
            return count;
        }, function (xhrObj) {
            var t = xhrObj.toString();
            Error("deleteNote failure: " + t);
        });
        return prom;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name deleteUser
     *
     * @description
     * Deletes a user
     *
     * @param theUuid
     *
     * @returns {*}
     */
    var deleteUser = function (theUuid) {
        var prom;
        var clause = {
            where: {
                uuid: theUuid
            }
        };
        prom = Users.destroy(clause).then(function (count) {
            return count;
        }, function (xhrObj) {
            var t = xhrObj.toString();
            Error("deleteUser failure: " + t);
        });
        return prom;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getCategories
     *
     * @description
     * Returns an array of categories records
     *
     * @returns {uuid, value, last_utc}
     */
    var getCategories = function () {
        var ret = [];
        ret = Categories.all().then(function (categories) {
                var results = [];
                for (var i = 0; i < categories.length; ++i) {
                    results[i] = categories[i].dataValues;
                }
                //resolve(results);
                return results;
            }, function (xhrObj) {
                var t = xhrObj.toString();
                Error("getCategories failure: " + t);
            }
        );
        return ret;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getNotes
     *
     * @description
     * Returns an array of notes records. Where src == undefined: 0, URL: 1, BODY: 2, by UUID: 3.
     * If src is URL the value is formatted in to an SQL WHERE clause. If src is BODY no formatting is
     * done and the value is used as-is. NOTE that the clause MUST be formatted as required by the
     * Sequelize module, see http://docs.sequelizejs.com/en/v3/docs/querying/#where. An empty query
     * will return ALL records.
     *
     * @param src == undefined: 0, URL: 1, BODY: 2, by UUID: 3
     * @param query String of the query
     *
     * @return Notes records or null
     */
    var getNotes = function (src, query) {
        var ret = [];
        var clause = undefined;
        if (src == SRC_URL) {                    // from URL
            clause = {
                where: {
                    details: {$contains: query}
                }
            };
        }
        else if (src == SRC_BODY) {              // from body
            clause = query;
        } else if (src == SRC_UUID) {            // by UUID
            clause = {
                where: {
                    uuid: query
                }
            };
        }
        if (clause == undefined) {
            clause = {
                where: {
                    uuid: {$ne: ""}
                }
            };
        }

        ret = Notes.findAll(clause).then(function (notes) {
            var results = [];
            for (var i = 0; i < notes.length; ++i) {
                results[i] = notes[i].dataValues;
            }
            return results;
        });

        return ret;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getPriorities
     *
     * @description
     * Returns an array of priorities records
     *
     * @returns {uuid, value, last_utc}
     */
    var getPriorities = function () {
        var ret = [];
        ret = Priorities.all().then(function (priorities) {
                var results = [];
                for (var i = 0; i < priorities.length; ++i) {
                    results[i] = priorities[i].dataValues;
                }
                //resolve(results);
                return results;
            }, function (xhrObj) {
                var t = xhrObj.toString();
                Error("getPriorities failure: " + t);
            }
        );
        return ret;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getStatuses
     *
     * @description
     * Returns an array of status records
     *
     * @returns {uuid, value, last_utc}
     */
    var getStatuses = function () {
        var ret = [];
        ret = Statuses.all().then(function (statuses) {
                var results = [];
                for (var i = 0; i < statuses.length; ++i) {
                    results[i] = statuses[i].dataValues;
                }
                //resolve(results);
                return results;
            }, function (xhrObj) {
                var t = xhrObj.toString();
                Error("getStatuses failure: " + t);
            }
        );
        return ret;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getUsers
     *
     * @description
     * Returns an array of user records. Where src == undefined: 0, URL: 1, BODY: 2, by UUID: 3.
     * If src is URL the value is formatted in to an SQL WHERE clause. If src is BODY no formatting is
     * done and the value is used as-is. NOTE that the clause MUST be formatted as required by the
     * Sequelize module, see http://docs.sequelizejs.com/en/v3/docs/querying/#where. An empty query
     * will return ALL records.
     *
     * @param src == undefined: 0, URL: 1, BODY: 2, by UUID: 3
     * @param query String of the query
     *
     * @returns {Array}
     */
    var getUsers = function (src, query) {
        var ret = [];
        var clause = undefined;
        if (src == SRC_URL) {                    // from URL
            clause = {
                where: {
                    details: {$contains: query}
                }
            };
        }
        else if (src == SRC_BODY) {              // from body
            clause = query;
        } else if (src == SRC_UUID) {            // by UUID
            clause = {
                where: {
                    uuid: query
                }
            };
        }
        if (clause == undefined) {
            clause = {
                where: {
                    uuid: {$ne: ""}
                }
            };
        }

        ret = Users.findAll(clause).then(function (users) {
            var results = [];
            for (var i = 0; i < users.length; ++i) {
                results[i] = users[i].dataValues;
            }
            return results;
        });

        return ret;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name saveNote
     *
     * @description
     * Save a note to the datastore
     *
     * @param note
     * @returns {*}
     */
    var saveNote = function (note) {
        var prom;
        note.last_utc = Date.now();
        prom = Notes.upsert(note).then(function (wasCreated) {
            return note;
        }, function (xhrObj) {
            var t = xhrObj.toString();
            Error("saveNote failure: " + t);
        });
        return prom;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name saveUser
     *
     * @description
     * Save a user to the datastore
     *
     * @param user
     * @returns {*}
     */
    var saveUser = function (user) {
        var prom;
        user.last_utc = Date.now();
        prom = Users.upsert(user).then(function (wasCreated) {
            return user;
        }, function (xhrObj) {
            var t = xhrObj.toString();
            Error("saveUser failure: " + t);
        });
        return prom;
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name createRandomNotes
     *
     * @description
     * Generate any number of random notes for testing.
     *
     * @param count
     * @param dStore
     *
     * @returns Array
     */
    var createRandomNotes = function (count, dStore) {
        var cats = [];
        var pris = [];
        var stas = [];
        var svrs = ['802221a5-1383-4ea4-b60e-1b5838a546e9', 'c90a407a-c12b-4046-a5c2-9bdeacef8036'];
        var cnt = 0;


        cats = getCategories().then(function (cats) {
                if (cats === undefined || cats.length == 0) {
                    return 0;
                }

                pris = getPriorities().then(function (pris) {
                        if (pris === undefined || pris.length == 0) {
                            return 0;
                        }

                        stas = getStatuses().then(function (stas) {
                                if (stas === undefined || stas.length == 0) {
                                    return 0;
                                }

                                tmpUsers = getUsers().then(function (lusrs) {
                                        if (lusrs === undefined || lusrs.length == 0) {
                                            createTestUsers(dStore);
                                            console.log('out of createTestUsers');
                                        } else {
                                            tmpUsers = lusrs;
                                        }

                                        var prom = wait.until(function () {
                                            var b = tmpUsers.length != undefined;
                                            return b;
                                        });

                                        prom.then(function () {
                                            console.log("tmpUsers " + (tmpUsers == Promise) ? "promise" : "data");

                                            for (var i = 0; i < count; ++i) {
                                                var now = utils.getNow();
                                                var xc = parseInt(Math.random() * cats.length);
                                                var xp = parseInt(Math.random() * pris.length);
                                                var xs = parseInt(Math.random() * stas.length);
                                                var xu = parseInt(Math.random() * tmpUsers.length);
                                                var xv = parseInt(Math.random() * svrs.length);

                                                var note = {
                                                    uuid: utils.getUUID(),
                                                    fk_categories_uuid: cats[xc].uuid,
                                                    fk_priorities_uuid: pris[xp].uuid,
                                                    fk_statuses_uuid: stas[xs].uuid,
                                                    fk_users_uuid: tmpUsers[xu].uuid,
                                                    fk_modifier_users_uuid: tmpUsers[xu].uuid,
                                                    plex_server_uuid: svrs[xv],
                                                    created_date: now,
                                                    modified_date: now,
                                                    last_utc: now,
                                                    title: "Title for #" + i + " (randomly generated)",
                                                    details: utils.loremIpsum(),
                                                    opt_in: (Math.random() < .5) ? 1 : 0
                                                };

                                                note = saveNote(note).then(function (fullNote) {
                                                        if (fullNote === undefined || fullNote.length == 0) {
                                                            return null;
                                                        }
                                                        ++cnt;
                                                        console.log("Created #" + cnt);
                                                        if (cnt == count) {
                                                            setGeneratedFlag(true);
                                                        }
                                                        return fullNote;
                                                    },
                                                    function (xhrObj) {
                                                        var t = xhrObj.toString();
                                                        Error(utils.ReturnObject(201, "Poar", "createRandomNotes failure: ", t));
                                                    }
                                                );

                                                console.log(xc + " " + xp + " " + xs + " " + xu + " " + xv);
                                            }
                                        });
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

        return cats;
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
            plex_user_uuid: '4b0d3c02-69cf-4df7-9b1d-4c837ab2629b',
            last_utc: utils.getNow(),
            friendly_name: 'Bill Gray',
            email: 'bill@somewhere.com',
            opt_in: 1,
            role: 'Administrator'
        };
        var ret = saveUser(u).then(function (fullUser) {

                // make a user
                var u = {
                    uuid: '7194caf4-8735-4a9e-8554-6a704bf97b48',
                    plex_user_uuid: '4ce92bc6-7464-4c31-8f74-1a00b194df11',
                    last_utc: utils.getNow(),
                    friendly_name: 'Todd Hill',
                    email: 'todd@somewhere.com',
                    opt_in: 1,
                    role: 'Administrator'
                };
                var ret = saveUser(u).then(function (fullUser) {

                        // make a user
                        var u = {
                            uuid: '9f1ecfcc-c751-4050-a4a3-a47a1c62cd27',
                            plex_user_uuid: '87d489ea-f5d7-44d7-99c4-3a183c9cac47',
                            last_utc: utils.getNow(),
                            friendly_name: 'Suzy User',
                            email: 'suzy@somewhere.com',
                            opt_in: 0,
                            role: 'User'
                        };
                        var ret = saveUser(u).then(function (fullUser) {

                                // make a user
                                var u = {
                                    uuid: '9f0305c7-0d40-480e-bdc5-813c6febb5e2',
                                    plex_user_uuid: 'd380a0fb-736d-412e-b440-2decb8a26865',
                                    last_utc: utils.getNow(),
                                    friendly_name: 'John Doe',
                                    email: 'john@somewhere.com',
                                    opt_in: 1,
                                    role: 'User'
                                };
                                var ret = saveUser(u).then(function (fullUser) {

                                        // return the new users from the datastore
                                        tmpUsers = getUsers().then(function (lusrs) {
                                                if (lusrs === undefined || lusrs.length == 0) {
                                                    return null;
                                                }
                                                tmpUsers = lusrs;
                                                // var prom = wait.until(function() {
                                                //     var b = tmpUsers.length != undefined;
                                                //     return b;
                                                // });
                                                // prom.then(function() {
                                                //     console.log("tmpUsers " + (tmpUsers == Promise) ? "promise" : "data");
                                                // });
                                                return tmpUsers;
                                            },
                                            function (xhrObj) {
                                                var t = xhrObj.toString();
                                                Error(utils.ReturnObject(201, "Get", "createTestUsers failure 5: ", t));
                                            }
                                        );

                                    },
                                    function (xhrObj) {
                                        var t = xhrObj.toString();
                                        Error(utils.ReturnObject(201, "Create", "acreateTestUsers failure 4: ", t));
                                    }
                                );

                            },
                            function (xhrObj) {
                                var t = xhrObj.toString();
                                Error(utils.ReturnObject(201, "Create", "createTestUsers failure 3: ", t));
                            }
                        );

                    },
                    function (xhrObj) {
                        var t = xhrObj.toString();
                        Error(utils.ReturnObject(201, "Create", "createTestUsers failure 2: ", t));
                    }
                );

            },
            function (xhrObj) {
                var t = xhrObj.toString();
                Error(utils.ReturnObject(201, "Create", "createTestUsersfailure 1: ", t));
            }
        );

        return ret;
    };

    // ----------------------------------------------------------------------------------------------------------------

    var getGeneratedFlag = function () {
        return generateFlag;
    };

    var setGeneratedFlag = function (val) {
        generateFlag = val;
        return generateFlag;
    };

    var getInitializedFlag = function () {
        return initializedFlag;
    };

    var setInitializedFlag = function (val) {
        initializedFlag = val;
        return initializedFlag;
    };

    var getSqlDb = function () {
        return sqlDb;
    };

    var getDbPath = function(name) {
        if (name == undefined) {
            if (dbName != undefined) {
                name = dbName;
            } else {
                name = "unspecified.sqlite";
            }
        }
        var dbPath = "../database/" + name;
        return dbPath;
    };

    // ----------------------------------------------------------------------------------------------------------------
    // exports
    return {
        SRC_UNDEFINED: SRC_UNDEFINED,
        SRC_URL: SRC_URL,
        SRC_BODY: SRC_BODY,
        SRC_UUID: SRC_UUID,
        init: init,
        deleteNote: deleteNote,
        deleteUser: deleteUser,
        getCategories: getCategories,
        getPriorities: getPriorities,
        getNotes: getNotes,
        getStatuses: getStatuses,
        getUsers: getUsers,
        saveNote: saveNote,
        saveUser: saveUser,
        createRandomNotes: createRandomNotes,
        getGeneratedFlag: getGeneratedFlag,
        getInitializedFlag: getInitializedFlag,
        setInitializedFlag: setInitializedFlag,
        getSqlDb: getSqlDb,
        getDbPath: getDbPath
    };

}

exports.Datastore = new Datastore();                            // singleton instance
