const puppeteer = require('puppeteer')
const fs = require('fs')

const detailPath = './detailUrl.json'
const unlinkPath = './unlink.json'
const downPath = './downUrl.json'

const readFs = (p) => {
  const data = fs.readFileSync(p)
  return JSON.parse(data)
}

const writeUnlink = (url) => {
  let data = []
  if (fs.existsSync(unlinkPath)) {
    data = readFs(unlinkPath)
  }
  data.push(url)
  fs.writeFile(unlinkPath, JSON.stringify(data), (err) => {
    if (err) {
      console.log(err)
    }
  })
}

const writeDownUrl = (key, value) => {
  let data = {}
  if (fs.existsSync(downPath)) {
    data = readFs(downPath)
  }
  data[key] = data[key] || []
  data[key].push(value)
  fs.writeFile(downPath, JSON.stringify(data), (err) => {
    if (err) {
      console.log(err)
    }
  })
}
  


const getDownloadUrl = async (page, url) => {
  await page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise((resolve) => { setTimeout(resolve, 6000) })
  await page.waitForSelector('div[class*=detail_content]', { visible: true })
  const hasA = await page.$$('div[class*=detail_content] a')
  console.log(hasA, hasA)
  if (!hasA.length) {
    return []
  } 
  const list = await page.$$eval('div[class*=detail_content] a', div => {
    return div.map(item => {
      return {
        downUrl: item.getAttribute('href'),
        title: item.innerText
      }
    })
  })
  console.log(list)
  return list
}

const start = async (page) => {
  const detailUrl = await readFs(detailPath)
  const keys = Object.keys(detailUrl)
  console.log('keys', keys)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const detailUrls = []
    Object.keys(detailUrl[key]).forEach(item => {
      detailUrls.push(...detailUrl[key][item])
    })
    for(let j = 0; j < detailUrls.length; j++) {
      const { href, title } = detailUrls[j]
      console.log(href, title)
      const list = await getDownloadUrl(page, href)
      if (!list.length) {
        writeUnlink(href)
        return
      }
      writeDownUrl(key, {
        title,
        detailUrl: href,
        list
      })
    }
  }
}

async function app() {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
  })
  const page = await browser.newPage()
  start(page)
}



app()