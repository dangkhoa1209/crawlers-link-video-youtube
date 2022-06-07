const puppeteer = require("puppeteer");
const youtubeLinkCrawler = require("../../controllers/youtube/youtubeLinkCrawler");
const config = require("../../config.json");



class YoutubeCrawlersView {
  constructor() {}
  async waitForSelector(element) {
    await this.page
      .waitForSelector(`${element}`, {
        timeout: config.HEADLESS_BROWSER_TIMEOUT,
      })
      .catch(async (e) => {
        if (e.name === "TimeoutError") {
          console.log("error time out: ", e);
          this.closeBrowser();
          youtubeLinkCrawler.start(function (err, result) {
            if (err) {
              console.log(err);
            }
          });
          return;
        }
        console.log("error orther: ", e);
        return;
      });
    return;
  }

  timeOut(time = 1000) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless       : true,
        executablePath : config.PATH_GOOGLE_CHROME,
        args           : config.PUPPETEER_ARGS,
      });
    }
    this.page = await this.browser.newPage();
    let pages = await this.browser.pages();
    await pages[0].close();
    return;
  }

  async checkBrowser(url){
    await this.initBrowser();
    if(!this.page){
      await this.goToPageCrawl(url);
    }
    return
  }


  async goToPageCrawl(url) {
    await this.page.goto(url, {
        timeout: config.HEADLESS_BROWSER_TIMEOUT,
      })
      .catch(async (e) => {
        if (e.name === "TimeoutError") {
          console.log("error time out: ", e);
          return;
        }
        console.log("error orther: ", e);
      });
    return;
  }

  async reloadPage(){
    await this.page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  }

  async scrollDownPage(){
    await this.page.evaluate(async () => {
      await new Promise((resolve, reject, async) => {
          var distance = 2000;
          var index = 0;
          var scrollD = function(){
            var scrollHeight = window.screen.height;
            console.log(scrollHeight);
            window.scrollBy(0, distance);
            distance += distance;
            if(index >= 14){
                clearInterval(intervalId);
                resolve();
            }
            index += 1;
          }

          var intervalId = setInterval(scrollD, 500);
      });
  });
  }


  closeBrowser() {
    this.browser && this.browser.close();
  }

}

module.exports = YoutubeCrawlersView;
