const parser = require('rss-parser-browser').parseURL
const colors = require('colors')
const { existsSync, writeFileSync, readFileSync } = require('fs')
const path = require('path')
const url = require('url')
function ls() {
  const index = getConfig()
  if (Object.keys(index).length > 0) {
    console.table(Object.values(index))
  } else log(`暂无RSS源，请添加。`)
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
  parser(rss, (err, parsed) => {
    if (!err) {
      const { entries, feedUrl, title, description } = parsed.feed
      const { host } = url.parse(feedUrl, true)
      const index = getConfig()
      index[host] = { title, feedUrl }
      writeFileSync(
        path.join(__dirname, `./rss.json`),
        JSON.stringify(index),
        (err) => log(err),
      )
      log(`${title}` + ` ${description || ''}`)
    } else log(`无法读取此RSS地址, ${err}`)
  })
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
  rss/rssx {options} {args}
            ls                       列出当前RSS源
            add http://xxx/rss       添加RSS源
            del {index}              删除index对应RSS源
            {index}                  阅读index对应RSS源
                                     打印此帮助信息
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
  const { feedUrl } = index[Object.keys(index)[number]]
  parser(feedUrl, (err, parsed) => {
    if (!err) {
      const { entries } = parsed.feed
      entries.forEach((i, idx) => {
        log(`${idx + 1}  ${i.title} `)
        log(`> ${i.link} `)
      })
    } else log(`无法读取此RSS地址, ${err}`)
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
    readFileSync(path.join(__dirname, `./rss.json`), 'utf8', true),
  )
}

module.exports = {
  ls: ls,
  add: add,
  del: del,
  help: help,
  get: get,
  log: log,
  getConfig: getConfig,
}
