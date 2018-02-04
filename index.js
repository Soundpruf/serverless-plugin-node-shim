const fs = require("fs-extra"),
  unzip = require("unzip2"),
  glob = require("glob"),
  archiver = require("archiver"),
  path = require("path");

class NodeShimPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      "after:package:createDeploymentArtifacts": this.transform.bind(this)
    };
  }

  transform() {
    this.serverless.cli.log("Applying node-shim...");

    return new Promise((resolve, reject) => {
      const { servicePath } = this.serverless.config,
        nodeShimDir = path.join(servicePath, ".serverless/node-shim"),
        artifactFile = path.join(
          servicePath,
          `.serverless/${this.serverless.service.service}.zip`
        ),
        functionObjects = this.serverless.service
          .getAllFunctions()
          .map(functionName => {
            return this.serverless.service.getFunction(functionName);
          }),
        handlerFiles = functionObjects.map(e =>
          e.handler.replace(/\.[\w_-]+$/, ".js")
        );

      // unzip
      const stream = fs
        .createReadStream(artifactFile)
        .pipe(unzip.Extract({ path: nodeShimDir }));

      stream.on("error", reject);

      stream.on("close", () => {
        const files = glob.sync("**/**", {
          cwd: nodeShimDir,
          dot: true,
          follow: true
        });

        files.forEach(file => {
          if (handlerFiles.indexOf(file) === -1) return;

          // console.info("apply node-shim to file", file);

          const src = path.join(nodeShimDir, file),
            dest = src.replace(/\.js$/, "-shimmed.js");

          fs.copyFileSync(src, dest);
          fs.copyFileSync(path.join(__dirname, "shim.js"), src);
        });

        const zip = archiver.create("zip");

        this.serverless.utils.writeFileDir(artifactFile);

        const output = fs.createWriteStream(artifactFile);

        output.on("open", () => {
          zip.pipe(output);

          files.forEach(file => {
            const fullPath = path.join(nodeShimDir, file),
              stat = fs.statSync(fullPath);

            if (!stat.isFile()) return;

            let idx = handlerFiles.indexOf(file);

            if (idx !== -1) {
              const shimFullPath = fullPath,
                shimmedFullPath = shimFullPath.replace(/\.js$/, "-shimmed.js"),
                shimCode = fs.readFileSync(shimFullPath).toString(),
                functionObject = functionObjects[idx];

              zip.append(
                shimCode
                  .replace(
                    /EXEC_PATH/g,
                    this.serverless.service.custom.nodeShim.execPath
                  )
                  .replace(
                    /HANDLERS/g,
                    functionObjects
                      .filter(
                        e => e.handler.replace(/\.[\w_-]+$/, ".js") === file
                      )
                      .filter(Boolean)
                      .map(e => e.handler.split(".").slice(-1)[0])
                      .join(",")
                  ),
                {
                  name: file
                }
              );

              zip.append(fs.readFileSync(shimmedFullPath), {
                name: file.replace(/\.js$/, "-shimmed.js")
              });
            } else {
              zip.append(fs.readFileSync(fullPath), {
                name: file,
                mode: 16877,
                // TODO: pass mode as 755
                // https://github.com/archiverjs/node-compress-commons/blob/master/lib/archivers/zip/constants.js#L49
                stats: stat
              });
            }
          });

          zip.finalize();
        });

        zip.on("error", reject);

        output.on("close", () => {
          // fs.removeSync(nodeShimDir);
          resolve(artifactFile);
        });
      });
    });
  }
}

module.exports = NodeShimPlugin;
