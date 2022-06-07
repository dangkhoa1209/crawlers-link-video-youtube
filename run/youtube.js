const schedule = require("node-schedule");


const youtubeLinkCrawler = require("../controllers/youtube/youtubeLinkCrawler")
var youtubeView = {
    runYoutubePostCrawlers: function () {
      console.log("Waiting to run");
      //var posts = schedule.scheduleJob('5 0 * * *', function () {
        youtubeLinkCrawler.start(function (err, result) {
          if (err) {
            console.log(err);
          }
         });
         console.log("Waiting to run");
      //});
  },
  run: function () {
    this.runYoutubePostCrawlers();
  },
};

youtubeView.run();


