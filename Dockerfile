FROM ubuntu:trusty
MAINTAINER azai91

# Install base packages
RUN apt-get update
# ESSENTIALS
RUN apt-get -y install nodejs npm
# Node JS
RUN ln -s "$(which nodejs)" /usr/bin/node
RUN npm install -g bower

#
# Add App
#
WORKDIR /app/

ADD package.json /app/package.json
RUN npm install
ADD .bowerrc /app/.bowerrc
ADD bower.json /app/bower.json
RUN bower install --allow-root

ADD client /app/public
ADD server /app/server
ADD config /app/config
ADD node app/app.js

EXPOSE 80 9200
WORKDIR /
