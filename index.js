#!/usr/bin/env node
const axios = require('axios').default
const xml = require('xml-parse')
const { existsSync, mkdirSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const colors = require('colors')
const url = require('url')
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

function ls() {
  const index = getConfig()
  if (Object.keys(index).length > 0) {
    console.table(Object.values(index))
  }
  log(`暂无RSS源，请添加。`)
}
function add(rss) {
  if (!rss) {
    log('请输入RSS链接')
    return
  }
  if (typeof rss !== 'string' || !/^https?:\/\//i.test(rss)) {
    log('RSS链接应为字符串，且以http(s)://开头。')
    return
  }
  const { host } = url.parse(rss, true)
  axios
    .get(rss)
    .then((res) => {
      const channel = getChannel(res.data)
      console.log(channel)
      return
      const { title, description, subtitle } = channel
      const index = getConfig()
      index[host] = { title, rss }
      writeFileSync(
        path.join(__dirname, `./rss.json`),
        JSON.stringify(index),
        (err) => log(err),
      )
      log(`${title}: ${description || subtitle}`)
    })
    .catch((error) => log(`无法读取此RSS地址${error}`))
}
function del(number) {
  if (!/^\d+$/.test(number)) {
    log(`请输入index number`)
    return
  }
  const index = getConfig()
  if (Object.keys(index).length - 1 < number) {
    log(`请输入正确的index number`)
    return
  }
  delete index[Object.keys(index)[number]]
  writeFileSync(
    path.join(__dirname, `./rss.json`),
    JSON.stringify(index),
    (err) => log(err),
  )
}
function help() {
  log(`
  rssx ls                       列出当前RSS源
  rssx add http://xxx/rss       添加RSS源
  rssx del {index}              删除index对应RSS源
  rssx {index}                  阅读index对应RSS源
  rssx                          打印此帮助信息

  或
  
  rss ls                        列出当前RSS源
  rss add http://xxx/rss        添加RSS源
  rss del {index}               删除index对应RSS源
  rss {index}                   阅读index对应RSS源
  rss                           打印此帮助信息
`)
}
function get(number) {
  if (!/^\d+$/.test(number)) {
    log(`请输入index number`)
    return
  }
  const index = getConfig()
  if (Object.keys(index).length - 1 < number) {
    log(`请输入正确的index number`)
    return
  }
  const { rss } = index[Object.keys(index)[number]]
  const { host } = url.parse(rss, true)
  axios
    .get(rss)
    .then((res) => {
      const channel = getChannel(res.data)
      const { item, entry } = channel
      const items = item || entry
      items.forEach((i, idx) => {
        log(`${idx + 1}  ${i.title} `)
        log(`> ${i.link} `)
      })
    })
    .catch((error) => log(error))
}
function getChannel(data) {
  return findChannel(xml.parse(data))
    .filter((i) => i?.length > 0)
    .flat()[0]['childNodes']
}
function findChannel(data) {
  if (data[0]?.innerXML?.includes('<title>')) return data
  return data.map((item) => {
    if (Array.isArray(item?.childNodes)) return findChannel(item?.childNodes)
  })
}
function log(str) {
  console.log(str.brightCyan)
}
function getConfig() {
  if (!existsSync(path.join(__dirname, `./rss.json`))) {
    writeFileSync(
      path.join(__dirname, `./rss.json`),
      JSON.stringify({}),
      (err) => log(err),
    )
  }
  return JSON.parse(
    readFileSync(path.join(__dirname, `./rss.json`), 'utf8', true) || {},
  )
}
