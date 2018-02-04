# serverless-plugin-node-shim
Serverless plugin to run your functions in nodejs version (8 LTS, 9+) on aws lambda

## Highlights

* No change in your application code necessary
* Integrates with `serverless-webpack` plugin

## Install & Configure

```bash
$ npm install serverless-plugin-node-shim --save-dev
```

Add the plugin to your `serverless.yml` file:

```yaml
plugins:
  - serverless-plugin-node-shim
```

Download and extract a x64 linux binary from https://nodejs.org/en/download/ into your project root

```bash
$ curl 'https://nodejs.org/dist/v8.9.4/node-v8.9.4-linux-x64.tar.xz' | tar xf -
```

Let the plugin know the path to your nodejs binary (relative to project root)

```yaml
custom:
  nodeShim:
    execPath: node-v8.9.4-linux-x64/bin/node
```

## Examples

[NodeJS 8 LTS](https://github.com/jzimmek/serverless-plugin-node-shim/tree/master/examples/node-v8-lts)

```bash
git clone https://github.com/jzimmek/serverless-plugin-node-shim
cd serverless-plugin-node-shim
npm install
cd examples/node-v8-lts
npm install
npm run deploy
npm run invoke
```

[NodeJS 9](https://github.com/jzimmek/serverless-plugin-node-shim/tree/master/examples/node-v9)

```bash
git clone https://github.com/jzimmek/serverless-plugin-node-shim
cd serverless-plugin-node-shim
npm install
cd examples/node-v9
npm install
npm run deploy
npm run invoke
```

[serverless-webpack + NodeJS 9](https://github.com/jzimmek/serverless-plugin-node-shim/tree/master/examples/with-webpack)

```bash
git clone https://github.com/jzimmek/serverless-plugin-node-shim
cd serverless-plugin-node-shim
npm install
cd examples/with-webpack
npm install
npm run deploy
npm run invoke
```

## Credits

This plugin is heavily inspired by the way [apex](https://github.com/apex/apex) is implemented. Reading the source code of [serverless-coffeescript](https://github.com/duanefields/serverless-coffeescript) was very helpful.
