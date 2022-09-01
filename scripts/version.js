/**
 * 打包发布时，输入版本信息
 */

const os = require("os");
const path = require("path");
const fs = require("fs");
const target = process.argv[3] || "single";

let versionFileName = `src/misc/version-${target}.json`;

const fileContent = fs.existsSync(versionFileName) ? fs.readFileSync(versionFileName) : "{}";
const versionFile = JSON.parse(fileContent);

// fs.rmSync(versionFile, {force: true});
// const target = process.argv[3] || "control";
// const target = "single";

const versionInfo = {
    versionName: target === "control" ? "短波摩尔斯码智能识别控制系统" : target === "terminal" ? "短波摩尔斯码智能收发报终端" : "短波自动收发报系统",
    versionNo : versionFile.versionNo || "V1.0" ,
    clientDesc: versionFile.clientDesc || "通用版本",
    updateDesc: "无",
    publishDate: "",
};

const versionData = [
    versionInfo.versionName,
    versionInfo.versionNo,
    versionInfo.clientDesc,
    versionInfo.updateDesc,
];

const versionTip = [
    `请输入发布版本名称[回车默认：${versionInfo.versionName}]:`,
    `请输入发布版本号[回车默认：${versionInfo.versionNo}]:`,
    `请输入客户简介[如："北京某单位版本"，回车默认：${versionInfo.clientDesc}]:`,
    `请输入更新说明[如：1.修改了XXX问题;2.增加了XXX功能。回车默认：${versionInfo.updateDesc}]:`,
];

let counter = 0;
console.log(versionTip[0]);

let stdin = process.openStdin();
stdin.on("data", function(chunk) {
    const input = chunk + "";
    if(input !== os.EOL) {
        versionData[counter] = input.trim();
    } else {
        console.log(versionData[counter], os.EOL);
    }

    counter++;
    if(counter > 3) {
        stdin.end("创建版本描述文件：" + versionFileName + os.EOL);
        versionInfo.versionName = versionData[0];
        versionInfo.versionNo = versionData[1];
        versionInfo.clientDesc = versionData[2];
        versionInfo.updateDesc = versionData[3];
        versionInfo.publishDate = new Date().toLocaleString();
        // console.log(versionInfo);
        fs.writeFileSync(versionFileName, JSON.stringify(versionInfo, null, "  "));
        process.exit();
    } else {
        console.log(versionTip[counter]);
    }

});



