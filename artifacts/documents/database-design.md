# Database Design Notes


The PlexNotes datastore is deliberately simple. This is to accommodate
datasources that span from simple and lightweight to commercial
heavylifters.


## Data Types
PlexNotes data types are based on SQLite Version 3.

### Date Data
Dates are stored in a text/string data type.

The last_utc data column uses Epoch Time (aka Unix time, POSIX time, or
Unix timestamp) as the number of elapsed seconds since midnight
1-Jan-1970. That column is intended to have the last time the record was
modified, for synchronization purposes.





