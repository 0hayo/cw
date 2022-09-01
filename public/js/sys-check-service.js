//
const path = require("path");
const { SqliteHwDB } = require("./sqlite-hw");
const moment = require("moment");

/** 底层硬件自检巡检所产生的日志数据库 */
const getRootDir = () => path.parse(process.cwd()).root;
const HARDWARE_CHECK_LOG_DB = path.join(getRootDir(), "tmp", "dev_status.db");

/** 系统状态表 */
const TABLE_STATUS = "Status";

let _debug = false;

/**
 * 系统自检、巡检日志服务
 */

var SYS = SYS || {};

SYS.SysCheckService = function(newDataHandler) {
  // if(!fs.existsSync(LOG_DB_DIR)) {
  //   fs.mkdirSync(LOG_DB_DIR, true);
  // }

  SYS._newDataHandler = newDataHandler;

};


/** 打开硬件监测数据库 */
const openHwDB = db => {
  let hwDb = null;
  try {
    hwDb = new SqliteHwDB(db, "r", false);
  } catch (e) {
    console.error("打开硬件监测据库", db ,"失败！！！", e);
  }

  return hwDb;
};



SYS.SysCheckService.setDebug = function (debug) {
  _debug = debug;
  // SqliteDB.setDebug(debug);
  SqliteHwDB.setDebug(debug);
};

SYS.SysCheckService.prototype.getLatestStatus = () => {
  let hwDb = null;
  try {
    //获取硬件数据库中最新的数据：
    hwDb = openHwDB(HARDWARE_CHECK_LOG_DB);
    const query = `SELECT * FROM ${TABLE_STATUS} ORDER BY time DESC LIMIT 1`;
    hwDb.queryData(query, SYS._newDataHandler);
  } catch (e) {
    console.error("查询硬件状态表失败", e);
    SYS._newDataHandler(null);
  } finally {
    if(hwDb) hwDb.close();
  }
};



/** 产生测试数据 */
SYS.SysCheckService.prototype.genTestData = count => {
  const insertSql = "INSERT INTO Error (id, time, code) values (?, ?, ?)";
  const time = moment();
  const dataSet = [];
  for(var i = 0; i < count; i++) {
    const record = [i + 22000, time.add(1, "s").format("YYYY-MM-DD HH:mm:ss"), "1001"];
    dataSet.push(record);
  }
  const db = new SqliteHwDB(HARDWARE_CHECK_LOG_DB, "w");
  db.insertData(insertSql, dataSet);
  db.close();
};

exports.SysCheckService = SYS.SysCheckService;
