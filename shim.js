if (process.send === undefined) {
  const execPath = __dirname + "/../BINARY";

  // TODO: max-executable-size
  // [
  //   "--max-old-space-size=820",
  //   "--max-semi-space-size=51",
  //   "--max-executable-size=102",
  //   "--expose-gc"
  //   ]
  const child = require("child_process"),
    proc = child.fork(__filename, [], {
      execPath,
      execArgv: ["--expose-gc"],
      env: process.env,
      cwd: process.cwd
    });

  proc.on("error", err => {
    console.error("[shim] error: %s", err);
    process.exit(1);
  });

  proc.on("exit", (code, signal) => {
    console.error("[shim] exit: code=%s signal=%s", code, signal);
    process.exit(1);
  });

  "HANDLERS".split(",").forEach(handler => {
    exports[handler] = (event, context, callback) => {
      context.callbackWaitsForEmptyEventLoop = false;

      const cbId = `${context.awsRequestId}-${Date.now()}`;

      proc.once("message", msg => {
        if (msg.type === "response" && msg.cbId === cbId)
          callback(msg.error, msg.value);
      });

      proc.send({
        type: "request",
        event: event,
        context: context,
        cbId,
        handler
      });
    };
  });
} else {
  process.on("message", msg => {
    handlers = require(__filename.replace(/\.js$/, "-shimmed"));

    let value = undefined,
      error = undefined;

    try {
      handlers[msg.handler](msg.event, msg.context, (_error, _value) => {
        value = _value;
        error = _error;
      });
    } catch (_error) {
      error = _error;
    }

    process.send({ type: "response", error, value, cbId: msg.cbId });
  });
}
