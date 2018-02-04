"use strict";

module.exports.hello = (event, context, callback) => {
  callback(
    null,
    `hurray, hello is running on node version: ${process.version}`
  );
};

module.exports.world = (event, context, callback) => {
  callback(
    null,
    `hurray, world is running on node version: ${process.version}`
  );
};
