/** sqlite3 封装 */
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

let _debug = false;

var DB = DB || {};

var dbExists = false;

DB.SqliteDB = function (file, mode, createIfNotExists = false) {
    DB.file = file;
    DB.exist = fs.existsSync(file);

    if (!DB.exist && createIfNotExists) {
        DB.db = new sqlite3.Database(
            file,
            function (error) {
                if(error) {
                    console.log("Creating db file error:", error);
                } else {
                    console.log("Creating db file success:", file);
                }
            }
        );
        // fs.openSync(file, "w");

    } else if (DB.exist) {
        const openMode = "r" === mode ? sqlite3.OPEN_READONLY : sqlite3.OPEN_READWRITE;
        try {
            DB.db = new sqlite3.Database(
                file,
                openMode,
                function (error) {
                    if(error) {
                        _debug && console.log("Open db file error:", error);
                    } else {
                        _debug && console.log("Open db file success:", file);
                    }
                }
            );

        } catch(e) {
            console.log("打开数据库:", file, "失败", e);
            dbExists = false;
        }
        dbExists = true;
    }
};

DB.printErrorInfo = function (err, sql = "none") {
    console.error("Error Message:" + err.message);
    console.error("DB:" + DB.file);
    console.error("SQL:" + sql);
};

DB.SqliteDB.prototype.createTable = function (sql) {
    DB.db.serialize(function () {
        DB.db.run(sql, function (err) {
            if (null != err) {
                DB.printErrorInfo(err, sql);
                return;
            }
        });
    });
};

DB.SqliteDB.prototype.exists = function () {
    return dbExists;
};

DB.SqliteDB.setDebug = function (debug) {
    _debug = debug;
};

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
DB.SqliteDB.prototype.insertData = function (sql, objects) {
    _debug && console.log("insert", DB.file, ", sql====", sql);
    DB.db.serialize(function () {
        var stmt = DB.db.prepare(sql);
        for (var i = 0; i < objects.length; ++i) {
            stmt.run(objects[i]);
        }
        stmt.finalize();
    });
};

DB.SqliteDB.prototype.updateData = function (sql, objects) {
    _debug && console.log("update", DB.file, ", sql====", sql);
    DB.db.serialize(function () {
        var stmt = DB.db.prepare(sql);
        for (var i = 0; i < objects.length; ++i) {
            stmt.run(objects[i]);
        }
        stmt.finalize();
    });
};

DB.SqliteDB.prototype.queryData = function (sql, callback) {
    _debug && console.log("query", DB.file, ", sql====", sql);
    if(!DB.db) {
        // console.error(`打开数据库失败！DB=${DB.file}`);
        callback([]);
        return;
    }
    DB.db.all(sql, function (err, rows) {
        if (err) {
            DB.printErrorInfo(err, sql);
            // callback(null);
            return;
        }
        // _debug && console.log("query result:");
        // _debug && console.table(rows);
        if (callback) {
            callback(rows);
        }
    });
};

DB.SqliteDB.prototype.executeSql = function (sql) {
    _debug && console.log("execute", DB.file, ", sql====", sql);
    DB.db.run(sql, function (err) {
        if (null != err) {
            DB.printErrorInfo(err, sql);
        }
    });
};

DB.SqliteDB.prototype.close = function () {
    DB.db && DB.db.close();
};

exports.SqliteDB = DB.SqliteDB;