/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

'use strict';

// ----------------------------------------------------------------------------------------------------------------

exports.getUUID = function () {
    var mod_uuid = require('uuid');
    var uid = mod_uuid.v4();
    console.log("# getUUID: " + uid);
    return uid;
};

