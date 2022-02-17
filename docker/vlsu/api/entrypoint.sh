#!/usr/bin/env bash

yarn install
tsc --watch &
nodemon ./bin/index.js
