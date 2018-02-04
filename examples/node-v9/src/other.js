"use strict";

module.exports.other = (event, context, callback) => {
  callback(
    null,
    `hurray, other is running on node version: ${process.version}`
  );
};
