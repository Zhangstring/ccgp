
const getUrl = (searchtype, keyword, buyerName, start, end, index = 1) => {
  return `http://search.ccgp.gov.cn/bxsearch?searchtype=${searchtype}&page_index=${index}&bidSort=0&buyerName=${buyerName}&projectId=&pinMu=0&bidType=0&dbselect=bidx&kw=${encodeURIComponent(keyword)}&start_time=${encodeURIComponent(start)}&end_time=${decodeURIComponent(end)}&timeType=6&displayZone=&zoneId=&pppStatus=0&agentName=`
}

// 获取详情页的链接
const getDetailUrl =  () => {
  const searchtype = 1 // 1标题 2全文
  const keyword = '资金分析' // 关键字
  const buyerName = '' // 采购人
  let start = ':01:01'
  let end = ':12:31'
  const detailList = []
  for(let i = 2013, len = 2023; i < len; i++) {
    let start_time = `${i}${start}`
    let end_time = `${i}${end}`
    const url = getUrl(searchtype, keyword, buyerName, start_time, end_time)
    detailList.push(url)
  }
  console.log(detailList)
}

getDetailUrl()