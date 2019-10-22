#!/bin/bash
apt-get update
apt-get upgrade
apt-get install nodejs-legacy
apt-get install npm
npm install n -g
n stable
cp -fr ../res-translate-tool /usr/local/lib/node_modules/
chmod -R 777 /usr/local/lib/node_modules/res-translate-tool/
echo "alias translate='/usr/local/lib/node_modules/res-translate-tool/translateTool'" >> /etc/bash.bashrc
source /etc/bash.bashrc
cd /usr/local/lib/node_modules/res-translate-tool/
npm install ./fs --save && npm install ./xmldom --save
