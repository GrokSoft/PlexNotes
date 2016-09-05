/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

/**
 * PlexNotes datastore interface - singleton
 */
function Datastore() {
    var Sequelize = require('sequelize');                       // datastore ORM

    var dbHost = 'localhost';
    var dbName = undefined;
    var dbPoolMax = 5;
    var dbPoolIdle = 10000;
    var dbDialect = undefined;
    var dStore = undefined;
    var logger = undefined;

    var Categories;
    var Notes;
    var Priorities;
    var Statuses;
    var Users;

    // ----------------------------------------------------------------------------------------------------------------
    // init
    /**
     * @name init
     *
     * @description Initialize the PlexNotes database interface. The database and tables will be created if they
     * do not exist. If created certain tables are pre-populated with basic data.
     *
     * @param aDbType
     * @param aDbName
     * @param aLogger
     * @returns {boolean} false=fatal error
     */
    var init = function (aDbType, aDbName, aLogger) {
        dbName = aDbName;
        logger = aLogger;
        // Setup the datastore interface
        // if (aDbType == 0) {
        //     dbDialect = 'static';
        //     dStore = dsStatic;
        //     logger.log('info', 'dbType set: static');
        //
        // } else if (aDbType == 1) {
        //     dbDialect = 'json';
        //     dStore = require('./datastore-json.js');
        //     dStore.setDataFile(aDbName);
        //     logger.log('info', 'dbType set: JSON');
        //
        // } else if (aDbType == 2) {
        dbDialect = 'sqlite';
        dStore = new Sequelize(dbName, 'plexnotes', 'plexnotes', {
            host   : dbHost,
            dialect: dbDialect,
            define : {
                timestamps: false                           // PlexNotes manages stamps
            },
            pool   : {
                max : dbPoolMax,
                min : 0,
                idle: dbPoolIdle
            },
            storage: '../database/' + dbName                // unique to SQLite
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
        Categories = dStore.define('categories', {
            uuid    : {
                type      : Sequelize.STRING(36),
                primaryKey: true,
                allowNull : false,
                unique    : true
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            value   : {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            indexes        : [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Categories.removeAttribute('id');
        Categories.sync().then(function () {
            Categories.count().then(function (c) {
                if (c < 1) {
                    Categories.create({
                        uuid    : 'be697ff3-2b1e-4189-b42c-f3ac51bf8b07',
                        last_utc: 1472522510,
                        value   : "None"
                    });
                    Categories.create({
                        uuid    : 'de85a7a4-395f-41ad-ab45-31a47fa37c14',
                        last_utc: 1472520233,
                        value   : "See details"
                    });
                    Categories.create({
                        uuid    : 'ea37de6a-5d7e-4418-bb0a-2eba5e352840',
                        value   : "Missing Episode/Sequel",
                        last_utc: 1472522778
                    });
                    Categories.create({
                        uuid    : 'd7e7bfdf-9651-47d6-b81f-6fa0210b79d8',
                        last_utc: 1472522799,
                        value   : "Needs Subtitles"
                    });
                    Categories.create({
                        uuid    : '7c0fc735-1e7e-4f3f-b57b-3a8d2e47a14b',
                        last_utc: 1472522815,
                        value   : "Needs Forced Subtitles"
                    });
                    Categories.create({
                        uuid    : 'e068e721-3474-49e6-8e9a-036485ff238d',
                        last_utc: 1472522830,
                        value   : "Error Streaming"
                    });
                    Categories.create({
                        uuid    : '653c459f-97c7-4d50-9409-5eda117ba18b',
                        last_utc: 1472522846,
                        value   : "Choppy Streaming"
                    });
                    Categories.create({
                        uuid    : '7d96aa61-af22-4b93-baf9-cc2d28f1f8d3',
                        last_utc: 1472522862,
                        value   : "Low Resolution"
                    });
                    Categories.create({
                        uuid    : 'fbd99efe-b7f8-476f-97f7-41936fc0b636',
                        last_utc: 1472522893,
                        value   : "Bad Audio"
                    });
                    Categories.create({
                        uuid    : '13ae190e-4886-446b-b5c0-880b6af340a1',
                        last_utc: 1472522934,
                        value   : "Low Audio"
                    });
                    Categories.create({
                        uuid    : 'c9d9b026-64b8-469b-a362-d82a281d16a0',
                        last_utc: 1472522952,
                        value   : "High Audio"
                    });
                    Categories.create({
                        uuid    : 'c782b3dc-a8b9-4b1a-bbca-aae1ab0b7723',
                        last_utc: 1472522973,
                        value   : "Add Artwork"
                    });
                }
            });
            return true;
        });

        //-------------------------------------------------------------------------------------------- Priorities ---------
        Priorities = dStore.define('priorities', {
            uuid    : {
                type      : Sequelize.STRING(36),
                primaryKey: true,
                allowNull : false,
                unique    : true
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            value   : {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            indexes        : [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Priorities.removeAttribute('id');
        Priorities.sync().then(function () {
            Priorities.count().then(function (c) {
                if (c < 1) {
                    Priorities.create({
                        'uuid'    : '4928cde2-c372-42dd-b56c-b5152a814bb4',
                        'last_utc': 1472525608,
                        'value'   : "Low"
                    });
                    Priorities.create({
                        'uuid'    : 'd6b096bf-5b0e-4eaf-b25b-e42e10e75d84',
                        'last_utc': 1472525645,
                        'value'   : "Normal"
                    });
                    Priorities.create({
                        'uuid'    : '16e106f1-0766-47df-b08e-d6c0fc5d91c3',
                        'last_utc': 1472525683,
                        'value'   : "High"
                    });
                    Priorities.create({
                        'uuid'    : 'fae24113-356c-4954-947d-83716946292b',
                        'last_utc': 1472525722,
                        'value'   : "Critical"
                    });
                }
            });
            return true;
        });

        //-------------------------------------------------------------------------------------------- Statuses -----------
        Statuses = dStore.define('statuses', {
            uuid    : {
                type      : Sequelize.STRING(36),
                primaryKey: true,
                allowNull : false,
                unique    : true
            },
            last_utc: {
                type: Sequelize.INTEGER
            },
            value   : {
                type: Sequelize.STRING
            }
        }, {
            freezeTableName: true,
            indexes        : [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Statuses.removeAttribute('id');
        Statuses.sync().then(function () {
            Statuses.count().then(function (c) {
                if (c < 1) {
                    Statuses.create({
                        'uuid'    : '3d9c3886-ca2d-49c5-8490-f8d5d919e211',
                        'value'   : "New",
                        'last_utc': 1472521553
                    });
                    Statuses.create({
                        'uuid'    : '8f6e8a32-6421-43d6-9165-c18ccb8d4e7a',
                        'value'   : "Open",
                        'last_utc': 1472521634
                    });
                    Statuses.create({
                        'uuid'    : '93a30a13-140d-418a-8c71-f8c9a5c59628',
                        'value'   : "Active",
                        'last_utc': 1472521795
                    });
                    Statuses.create({
                        'uuid'    : '82ae28a1-f981-43ac-b3bd-74b4d24789d3',
                        'value'   : "On hold",
                        'last_utc': 1472521835
                    });
                    Statuses.create({
                        'uuid'    : 'd9814799-1471-4392-bead-92117c464835',
                        'value'   : "Duplicate",
                        'last_utc': 1472522152
                    });
                    Statuses.create({
                        'uuid'    : '7946f084-c489-4612-ac25-23dd9e40f336',
                        'value'   : "Will not fix",
                        'last_utc': 1472522163
                    });
                    Statuses.create({
                        'uuid'    : '5daa0c72-85c3-49a4-bf26-1eb2985ce0a8',
                        'value'   : "Closed",
                        'last_utc': 1472522171
                    });
                }
            });
            return true;
        });

        //-------------------------------------------------------------------------------------------- Users --------------
        Users = dStore.define('users', {
            uuid          : {
                type      : Sequelize.STRING(36),
                primaryKey: true,
                allowNull : false,
                unique    : true
            },
            plex_user_uuid: {
                type: Sequelize.STRING(36)
            },
            last_utc      : {
                type: Sequelize.INTEGER
            },
            friendly_name : {
                type: Sequelize.STRING
            },
            email         : {
                type: Sequelize.STRING
            },
            opt_in        : {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true,
            indexes        : [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Users.removeAttribute('id');
        Users.sync();

        //-------------------------------------------------------------------------------------------- Notes --------------
        Notes = dStore.define('notes', {
            uuid                  : {
                type      : Sequelize.STRING(36),
                primaryKey: true,
                allowNull : false,
                unique    : true
            },
            fk_categories_uuid    : {
                type      : Sequelize.STRING(36),
                references: {
                    model: Categories,
                    key  : 'uuid'
                }
            },
            fk_priorities_uuid    : {
                type      : Sequelize.STRING(36),
                references: {
                    model: Priorities,
                    key  : 'uuid'
                }
            },
            fk_statuses_uuid      : {
                type      : Sequelize.STRING(36),
                references: {
                    model: Statuses,
                    key  : 'uuid'
                }
            },
            fk_users_uuid         : {
                type      : Sequelize.STRING(36),
                references: {
                    model: Users,
                    key  : 'uuid'
                }
            },
            fk_modifier_users_uuid: {
                type: Sequelize.STRING(36)
            },
            plex_server_uuid      : {
                type: Sequelize.STRING(36)
            },
            created_date          : {
                type: Sequelize.INTEGER
            },
            modified_date         : {
                type: Sequelize.INTEGER
            },
            last_utc              : {
                type: Sequelize.INTEGER
            },
            title                 : {
                type: Sequelize.STRING
            },
            details               : {
                type: Sequelize.TEXT
            },
            opt_in                : {
                type: Sequelize.INTEGER
            }
        }, {
            freezeTableName: true,
            indexes        : [
                {
                    unique: true,
                    fields: ['uuid']
                }
            ]
        });
        Notes.removeAttribute('id');
        Notes.sync();

    }; // init

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getCategories
     *
     * @description Returns an array of categories records
     *
     * @returns {uuid, value, last_utc}
     */
    var getCategories = function () {
        Categories.all().then(function (categories) {
            return categories;
        });
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getNotes
     *
     * @description
     * Get the notes from the file.
     */
    var getNotes = function (query) {
        var ret = [];
        // notes.forEach(function (node) {
        //     // Test for a query string
        //     if (query === undefined || node.search(query) != -1)
        //         ret.push(node);
        // });
        if (ret.length == 0) {
            ret = null;
        }
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name getPriorities
     *
     * @description Returns an array of priorities records
     *
     * @returns {uuid, value, last_utc}
     */
    var getPriorities = function () {
        Priorities.all().then(function (priorities) {
            return priorities;
        });
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
        Statuses.all().then(function (statuses) {
            return statuses;
        });
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
        Users.all().then(function (users) {
            return users;
        });
    };

    // ----------------------------------------------------------------------------------------------------------------
    /**
     * @name saveNote
     *
     * @description
     * Save the notes to a file
     */
    var saveNote = function () {
        return null;
    };

    // ----------------------------------------------------------------------------------------------------------------
    // exports
    return {
        // getAllNotes: getAllNotes,
        init         : init,
        getCategories: getCategories,
        getPriorities: getPriorities,
        getStatuses  : getStatuses,
        getUsers     : getUsers,
        saveNote     : saveNote,
        getNotes     : getNotes
    };

};

exports.Datastore = new Datastore();                            // singleton instance
