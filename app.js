const puppeteer = require('puppeteer')
const fs = require('fs')

const detailPath = './detailUrl.json'

const readDetailUrl = () => {
  const data = fs.readFileSync(detailPath)
  return JSON.parse(data)
}

const writeDetailUrl = (keyword, start, list) => {
  let data = {}
  if (fs.existsSync(detailPath)) {
    data = readDetailUrl()
  } 
  data[keyword] = data[keyword] || {}
  data[keyword][start] = list
  fs.writeFile('./detailUrl.json', JSON.stringify(data), (err) => {
    if (err) {
      console.log(err)
    }
  })
}


const getUrl = (keyword, start, end, index = 1) => {
  return `http://search.ccgp.gov.cn/bxsearch?searchtype=1&page_index=${index}&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=0&dbselect=bidx&kw=${encodeURIComponent(keyword)}&start_time=${encodeURIComponent(start)}&end_time=${decodeURIComponent(end)}&timeType=6&displayZone=&zoneId=&pppStatus=0&agentName=`
}

// 获取页面中列表的url
const getDetailUrlList = async (page, url) => {
  page.goto(url, { waitUntil: 'networkidle0' })
  await new Promise((resolve) => { setTimeout(resolve, 10000) })
  await page.waitForSelector('.vT-srch-result-list-bid', { visible: true })
  const listContainer = await page.$$('.vT-srch-result-list-bid li')
  const pageContainer = await page.$$('.pager a') || []
  let pageTotal = pageContainer.length ? pageContainer.length -2 : 0
  let list = []
  for (let i = 0; i < listContainer.length; i++) {
    const item = await listContainer[i]
    const href = await item.$eval('a', el => el.getAttribute('href'))
    const title = await item.$eval('a', el => el.innerText)
    list.push({ href, title })
  }
  return {
    list,
    pageTotal
  }
}

// 指定时间段内的搜索结果
const searchPage = async (page, keyword, start, end) => {
  console.log(keyword, start, end)
  const url = getUrl(keyword, start, end)
  const { list, pageTotal } = await getDetailUrlList(page, url)
  for (let i = 2; i < pageTotal + 1; i++) {
    const nextUrl = getUrl(keyword, start, end, i)
    const { list: nextList } = await getDetailUrlList(page, nextUrl)
    list.push(...nextList)
  }
  return list
}

// 获取详情页的链接
const getDetailUrl = async (page) => {
  const keyword = '综合治税'
  let start = ':01:01'
  let end = ':12:31'
  const detailList = []
  for(let i = 2013, len = 2023; i < len; i++) {
    let start_time = `${i}${start}`
    let end_time = `${i}${end}`
    const list = await searchPage(page, keyword, start_time, end_time)
    writeDetailUrl(keyword, i, list)
    detailList.push(...list)
  }
}

async function app() {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
  })
  const page = await browser.newPage()
  getDetailUrl(page)
}

app()