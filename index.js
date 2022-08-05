#!/usr/bin/env node
const { get, ls, add, del, help } = require('./methods')
const { argv } = process
switch (/^\d+$/.test(argv[2])) {
  case true:
    get(argv[2])
    break
  default:
    switch (argv[2]) {
      case 'ls':
        ls()
        break
      case 'add':
        add(argv[3])
        break
      case 'del':
        del(argv[3])
        break
      default:
        help()
    }
}
