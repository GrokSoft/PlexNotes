/*
 * Copyright (c) 2016. GrokSoft LLC - All Rights Reserved
 */

/**
 * Generate a new UUID.
 *
 * Usage:  Just run it, no arguments.
 */

'use strict';

var uuid = require('uuid');
var id;

// generate a v4 random uuid
id = uuid.v4();

console.log("\n\nNew UUID:  " + id + "\n\n");
