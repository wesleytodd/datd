# DatD - Dat Daemon

[![NPM Version](https://img.shields.io/npm/v/@wesleytodd/datd.svg)](https://npmjs.org/package/@wesleytodd/datd)
[![NPM Downloads](https://img.shields.io/npm/dm/@wesleytodd/datd.svg)](https://npmjs.org/package/@wesleytodd/datd)
[![Build Status](https://travis-ci.org/wesleytodd/datd.svg?branch=master)](https://travis-ci.org/wesleytodd/datd)
[![js-happiness-style](https://img.shields.io/badge/code%20style-happiness-brightgreen.svg)](https://github.com/JedWatson/happiness)

DatD is a daemon for keeping track and hosting [Dat Archives](https://datproject.org/).  It is mainly a cli
tool, but also is packaged for use in your applications.

## Install

```
$ npm install --save @wesleytodd/datd
```

## Usage

Basic usage will start a datd process on `localhost:29101` and open a database in your working directory `.db`:

```
$ datd
```

Once the daemon is started, you can begin sending it commands, for example, lets create a new dat in our home director:

```
$ mkdir ~/test
$ datd create ~/test
┌───────────────┬──────────────────────────────────────────────────────────────────┐
│ Path          │ test                                                             │
├───────────────┼──────────────────────────────────────────────────────────────────┤
│ Key           │ 467f50218b5d2f86203ba1372f11f966e75c5a0040d9d14dddbff62f53572ad4 │
├───────────────┼──────────────────────────────────────────────────────────────────┤
│ Discovery Key │ 2aabc18fe138104822fe6f395ec8165d9cfe1942bbca1bbc40dd3acd4962787e │
├───────────────┼──────────────────────────────────────────────────────────────────┤
│ Owner?        │ true                                                             │
├───────────────┼──────────────────────────────────────────────────────────────────┤
│ Live?         │ true                                                             │
└───────────────┴──────────────────────────────────────────────────────────────────┘
```

As you can see, it created a dat for you which you can access at `dat://467f50218b5d2f86203ba1372f11f966e75c5a0040d9d14dddbff62f53572ad4` in a browser like [Beaker](https://beakerbrowser.com/).

Now that you have a dat in there, you can see a list of dats currently managed by the daemon:

```
$ datd ls
┌───────────────────┬──────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────┬────────┬───────┐
│ Path              │ Key                                                              │ Discovery Key                                                    │ Owner? │ Live? │
├───────────────────┼──────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────┼────────┼───────┤
│ test/             │ 467f50218b5d2f86203ba1372f11f966e75c5a0040d9d14dddbff62f53572ad4 │ 2aabc18fe138104822fe6f395ec8165d9cfe1942bbca1bbc40dd3acd4962787e │ true   │ true  │
└───────────────────┴──────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────┴────────┴───────┘
```

## TODO: this is a work in progress, more commands to come

1. Remove dat
2. Start/Stop serving a dat
3. Conslidate to one discovery-swarm
4. Replicate other dats from the net
5. ...

## Development

The tests can be run with `npm test`, which also runs the linter and any other builds steps for the module.
When a release is ready, use npm to bump the version:

```
$ npm version minor
$ npm publish
```

A post publish script pushes the work and the tags.  Pull requests should be made against master or the currently active development branch.
