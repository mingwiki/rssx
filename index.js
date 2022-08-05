#!/usr/bin/env node
const { ls, add, del, help, get } = require('./methods')
switch (/^\d+$/.test(process.argv[2])) {
  case true:
    get(process.argv[2])
    break
  default:
    switch (process.argv[2]) {
      case 'ls':
        ls()
        break
      case 'add':
        add(process.argv[3])
        break
      case 'del':
        del(process.argv[3])
        break
      default:
        help()
    }
}
