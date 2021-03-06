#!/usr/bin/env node
'use strict'

const meow = require('meow')

const commands = {
  start: require('./start')
}

const commandNames = Object.keys(commands)
const commandList = commandNames.join(', ')
const unknowns = []
const alias = {
  entry: ['e'],
  optimize: ['o'],
  browse: ['b'],
  port: ['p']
}

const cli = meow(`
  Usage
    $ bankai <command> [options]

  Commands
    start       Start a bankai server

    Options
      -e, --entry=<id>       Resolve <id> from cwd and use as entry module [default: .]
                             Entry module is expected to export () -> app
      -p, --port=<n>         Bind bankai to <n> [default: 1337]
      -o, --optimize         Optimize the page and all assets served by bankai [default: false]
      -b, --browse=<app>     Browse the page served by bankai with <app> [default: false]
      --html.entry=<uri>     Serve client js at <uri> [default: bundle.js]
      --html.css=<uri>       Serve client css at <uri> [default: bundle.css]
      --html.favicon         Disable favicon [default: true]
      --html.title           Title to use for page
      --html.lang            Lang attribute to use [default: en]
      --css.use              sheetify plugins to use
      --js.<opt>=<value>     Pass key <opt> with <value> to browserify

  Examples
    $ bankai start
    Started bankai for index.js on http://localhost:1337

    $ bankai start --entry=basic
    Started bankai fro basic/index.js on http://localhost:1337

    $ bankai start --port=3000
    Started bankai for index.js on http://localhost:3000

    $ bankai start --open
    Started bankai for index.js on http://localhost:1337
    Opening http://localhost:1337 with default browser

    $ bankai start --open Safari
    Started bankai for index.js on http://localhost:1337
    Opening http://localhost:1337 with system browser

    $ bankai start --html.title bankai
    Started bankai for index.js on http://localhost:1337

    $ bankai start --css.use sheetify-cssnext
    Started bankai for index.js on http://localhost:1337

    $ bankai start --js.fullPaths=false
  `,
  {
    alias: alias,
    string: [
      'entry',
      'html.entry',
      'html.css',
      'html.title',
      'css.use',
      'js.noParse',
      'js.transform',
      'js.ignoreTransform',
      'js.plugin',
      'js.extensions',
      'js.basedir',
      'js.paths',
      'js.commondir',
      'js.builtins',
      'js.bundleExternal',
      'js.browserField',
      'js.insertGlobals',
      'js.standalone',
      'js.externalRequireName'
    ],
    boolean: [
      'optimize',
      'js.fullPaths',
      'js.debug'
    ],
    unknown: function (flag) {
      if (flag in commands) {
        return
      }
      unknowns.push(flag)
    }
  })

const aliasNames = Object.keys(alias)
  .reduce(function (r, i) {
    return r.concat(alias[i])
  }, [])

function main (commandName, options, cb) {
  let error

  if (typeof commandName !== 'string') {
    error = new Error(`Missing command parameter. Available commands: ${commandList}`)
    error.cli = true
    return cb(error)
  }

  if ((commandName in commands) === false) {
    error = new Error(`Unknown command ${commandName}. Available commands: ${commandList}`)
    error.cli = true
    return cb(error)
  }

  if (unknowns.length > 0) {
    error = new Error(`Unkown flags detected: ${unknowns.join(', ')}`)
    error.cli = true
    return cb(error)
  }

  // Remove short hand pointers
  aliasNames.forEach(function (aliasName) {
    delete options[aliasName]
  })

  const command = commands[commandName]
  command(options, cb)
}

main(cli.input[0], cli.flags, error => {
  if (error) {
    if (error.cli) {
      console.error(`${cli.help}\n${error.message}`)
      return process.exit(1)
    }
    throw error
  }
})
