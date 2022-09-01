npm# 1T6管理终端

## 项目名称

> 1T6 Management Terminal - GUI
> 1T6管理终端 - 客户端软件

## 运行条件

> node + react + electron

* 安装node， version: >=12.11.1
* 安装npm
* cnpm : npm install -g cnpm

## 开发环境运行说明

> git clone 下载本项目代码

* cnpm install
* npm run postinstall
* npm run rebuild
* npm run dev

## 版本打包说明

> 打包成Linux、Win、Mac下的安装包

* Linux: npm run dist
* Win  : npm run dist:win
* Mac  : npm run dist:mac
* test


## 提示electron未正确安装（Windows下常见）：

* ... Electron failed to install correctly ...
* 1. 设置环境变量：ELECTRON_MIRROR = http://npm.taobao.org/mirrors/electron/
  * 或者：npm config set electron_mirror “https://npm.taobao.org/mirrors/electron/”
* 2. 删除node_modules下的electron目录
* 3. cnpm i
* 4. cd node_modules/electron, 运行：node install.js
* 参考： https://zhuanlan.zhihu.com/p/108380451
