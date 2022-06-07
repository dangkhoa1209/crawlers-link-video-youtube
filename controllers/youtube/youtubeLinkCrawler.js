const youtubeCrawlers = require("../../crawlers/youtube/youtubeCrawlers");
const config = require("../../config.json");
const getJSON = require('get-json');
const fs = require("fs");

 
var youtubeLinkCrawler = {
    start: async function (callback) {
        // callback = callback || function () { };
        var dataResults = [];
        var idResults = []; //những id video đã được lưu
        var countError = 0; //lưu lại số gặp lỗi liên tục

        console.log("Run crawl youtube post at: ", new Date());
        var postCrawler = new youtubeCrawlers();
        try {
            let urls = []; //url một lần load page
            await postCrawler.initBrowser();
            await postCrawler.goToPageCrawl(config.YOUTUBE_CRAWLER.URL);
            await postCrawler.scrollDownPage();
            await postCrawler.waitForSelector("#contents");
            // get all links video youtube on page
            urls = await postCrawler.page.$$eval("#dismissible > ytd-thumbnail", (links) => {
                links = links.map((el) => el.querySelector("#thumbnail").href);
                return links;
            });


            //Sau khi lấy được list urls thì gọi hàm tách đê lấy list ID
            var listIdVideo = getIdVideoYoutubeByListUrl(urls);


            try {
                //Xử lý có điều kiện
                let indexId = 0;
                let forEachListIdVideo = async function () {


                    //Kiểm tra nếu số lần gặp lỗi liên tục lớn thì tạm dừng chương trình và lưu những thông tin đã lấy trước đó
                    //Lỗi này thường do API
                    if (countError >= config.YOUTUBE_CRAWLER.COUNT_ERROR || dataResults.length >= config.YOUTUBE_CRAWLER.TOTAL_ID) {
                        await postCrawler.closeBrowser();
                        clearInterval(intervalId);
                        savePostToJsonFile(dataResults);
                        return;
                    }


                    if (listIdVideo[indexId] != "" && listIdVideo[indexId] != undefined && listIdVideo[indexId] != null) {
                        let idVideo = listIdVideo[indexId];
                        if (!idResults.includes(idVideo)) {
                            let urlVideoAPI = config.VIDEO_API.URL + "?part=" + config.VIDEO_API.PART + "&id=" + idVideo + "&key=" + config.VIDEO_API.KEY;
                            getJSON(urlVideoAPI)
                                .then(function (dataVideoJson) {
                                    //kiểm tra điều kiện lượt xem
                                    if (filterVideo(dataVideoJson)) {


                                        channelID = dataVideoJson.items[0].snippet.channelId;
                                        urlChannelApi = config.CHANNEL_API.URL + "?part=" + config.CHANNEL_API.PART + "&id=" + channelID + "&key=" + config.CHANNEL_API.KEY;
                                        getJSON(urlChannelApi)
                                            .then(function (dataChannelJson) {
                                                //kiểm tra điều kiện lượt xem
                                                if (filterChannel(dataChannelJson)) {
                                                    let dataJsonAndChanel = getData(dataVideoJson, dataChannelJson);
                                                    if (dataJsonAndChanel != "" && dataJsonAndChanel != null && dataJsonAndChanel != undefined) {
                                                        if (!dataResults.includes(dataJsonAndChanel)) {
                                                            dataResults.push(dataJsonAndChanel);
                                                            idResults.push(idVideo);
                                                            countError = 0;
                                                            console.log(dataResults.length + "/" + config.YOUTUBE_CRAWLER.TOTAL_ID)
                                                            //Khi đã lấy đủ số lượng thông tin dừng chương trình và lưu thông tin vào file
                                                            if (dataResults.length >= config.YOUTUBE_CRAWLER.TOTAL_ID) {
                                                                savePostToJsonFile(dataResults);
                                                                clearInterval(intervalId);
                                                                postCrawler.closeBrowser();
                                                                return;
                                                            }
                                                        } else {
                                                            console.log("Video đã được lấy trước đó")
                                                        }

                                                    }
                                                }
                                            }).catch(function (error) {
                                                countError += 1;
                                                console.log("Lỗi API channel")
                                                console.log("Số lần gặp lỗi liên tục: " + countError);
                                                savePostToJsonFile(dataResults);
                                            });

                                    } else {
                                        //Những video không thoả điều kiện cũng lưu vào để những lần sau không gọi nữa, tránh phí API
                                        idResults.push(idVideo);
                                        console.log("Video không thoả điều kiện");
                                    }

                                }).catch(function (error) {
                                    countError += 1;
                                    console.log("Lỗi API video");
                                    console.log("Số lần gặp lỗi liên tục: " + countError);
                                    savePostToJsonFile(dataResults);
                                });
                        } else {
                            console.log("Id video đã được lấy trước đó")
                        }
                    } else {
                        countError += 1;
                        console.log("ID video rỗng");
                        console.log("Số lần gặp lỗi liên tục: " + countError);
                        savePostToJsonFile(dataResults);
                    }




                    indexId += 1;
                    if (indexId == listIdVideo.length - 1) {
                        if (dataResults.length < config.YOUTUBE_CRAWLER.TOTAL_ID) {
                            runningCrawler = true;
                            //await postCrawler.initBrowser();
                            //await postCrawler.goToPageCrawl(config.YOUTUBE_CRAWLER.URL);
                            await postCrawler.reloadPage();
                            await postCrawler.scrollDownPage();
                            await postCrawler.waitForSelector("#contents");
                            // get all links video youtube on page
                            urls = await postCrawler.page.$$eval("#dismissible > ytd-thumbnail", (links) => {
                                links = links.map((el) => el.querySelector("#thumbnail").href);
                                return links;
                            });

                            listIdVideoTmp = await getIdVideoYoutubeByListUrl(urls);
                            if(listIdVideoTmp.length == 0){
                                indexId = 0;
                            }
                            listIdVideoTmp2 = [];
                            await listIdVideoTmp.forEach((idVideo, index) => {
                                if (!idResults.includes(idVideo)) {
                                    listIdVideoTmp2.push(idVideo);
                                }
                                if (index >= listIdVideoTmp.length - 1 && listIdVideoTmp2.length != 0) {
                                    listIdVideo = listIdVideoTmp2;
                                    indexId = 0;
                                }
                            });
                            
                        } else {
                            savePostToJsonFile(dataResults);
                            clearInterval(intervalId);
                            postCrawler.closeBrowser();
                            return;
                        }
                    }
                }

                intervalId = await setInterval(forEachListIdVideo, 1000);
                return;
            } catch (e) {

                countError += 1;
                console.log("Number of consecutive errors: " + countError);
                if (countError >= config.YOUTUBE_CRAWLER.COUNT_ERROR || dataResults.length >= config.YOUTUBE_CRAWLER.TOTAL_ID) {
                    clearInterval(intervalId);
                    savePostToJsonFile(dataResults);
                    postCrawler.closeBrowser();
                    return;
                }

            }


        } catch (e) {
            console.log(e);
            postCrawler.closeBrowser();
            savePostToJsonFile(dataResults);
            clearInterval(intervalId);
            return;
        }

    },
};

function getIdVideoYoutubeByUrl(url) {
    //tách link youtube lấy ID
    //https://www.youtube.com/watch?v=ShL0eAFYwBE => ShL0eAFYwBE
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match;
    try {
        match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : "";
    } catch (e) {
        console.log("Error getIdVideoYoutubeByListUrl")
        console.log(e);
    }
    return "";
}

function getIdVideoYoutubeByListUrl(urls) {
    //tách link youtube lấy ID
    //https://www.youtube.com/watch?v=ShL0eAFYwBE => ShL0eAFYwBE
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match;
    let listIdVideo = [];
    try {
        urls.forEach(url => {
            match = url.match(regExp);
            listIdVideo.push((match && match[7].length == 11) ? match[7] : "");
        });
    } catch (e) {
        console.log(e)
    }
    return listIdVideo;
}

/*
  *Từ data thông tin của video xem xét điều kiện và trả về kết quả
  * true nếu thoả điều kiện
  * false nếu không thoả điều kiện
*/
function filterVideo(dataVideoJson) {
    try {
        if (config.YOUTUBE_CRAWLER.FILTER) {
            if (dataVideoJson != null && dataVideoJson != "" && dataVideoJson != undefined) {
                if (dataVideoJson.items[0].statistics.viewCount >= config.YOUTUBE_CRAWLER.FILTER_VIEWS) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return true;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

function filterChannel(dataChannelJson) {
    try {
        if (config.YOUTUBE_CRAWLER.FILTER) {
            if (dataChannelJson != null && dataChannelJson != "" && dataChannelJson != undefined) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

function getData(dataVideoJson, dataChannelJson) {
    try {
        let videoTitle = "", linkVideo = "", viewCount = -1, likeCount = -1, dislikeCount = -1, commentCount = -1, channelName = "", subscribers = -1, linkChannel = "";
        videoTitle = dataVideoJson.items[0].snippet.title;
        linkVideo = "https://www.youtube.com/watch?v=" + dataVideoJson.items[0].id;
        viewCount = dataVideoJson.items[0].statistics.viewCount;
        likeCount = dataVideoJson.items[0].statistics.likeCount;
        dislikeCount = dataVideoJson.items[0].statistics.dislikeCount;
        commentCount = dataVideoJson.items[0].statistics.commentCount;
        channelName = dataChannelJson.items[0].snippet.title;
        subscribers = dataChannelJson.items[0].statistics.subscriberCount;
        linkChannel = "https://www.youtube.com/channel/" + dataVideoJson.items[0].snippet.channelId;

        return {
            "videoTitle": videoTitle,
            "linkVideo": linkVideo,
            "viewCount": Number(viewCount),
            "likeCount": Number(likeCount),
            "dislikeCount": Number(dislikeCount),
            "commentCount": Number(commentCount),
            "channelName": channelName,
            "subscribers": Number(subscribers),
            "linkChannel": linkChannel,
        }
    } catch (e) {
        console.log(e);
        return "";
    }
}



function savePostToJsonFile(posts) {
    let date = new Date();
    let filename = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + ".json";
    let path = `./data/youtube/${filename}`;
    fs.open(path, "wx", function () { });
    fs.readFile(path, "utf8", function readFileCallback(err, data) {
        let dataJson;
        if (err) {
            console.log(err);
            return;
        }
        if (data === "") {
            dataJson = {};
            dataJson["data"] = posts;
            dataJson["totalResults"] = posts.length;
            fs.writeFile(path, JSON.stringify(dataJson, null, 2), "utf8", () => { });
            console.log("Copied to file: " + posts.length);
            return;
        }
        dataJson = JSON.parse(data);
        dataJson["data"] = posts;
        dataJson["totalResults"] = posts.length;
        fs.writeFile(path, JSON.stringify(dataJson, null, 2), "utf8", () => { });
        console.log("Written to file: " + posts.length);
        return;
    });

    return;
}



module.exports = youtubeLinkCrawler;
