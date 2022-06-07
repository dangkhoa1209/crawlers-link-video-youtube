1. Mô tả
    Đây là bot có chức năng cào và lưu lại link video của youtube và kết hợp api do yotube cung cấp để lấy được thông tin chi tiết của video(số lượng thích, bình luận ...) và thông tin kênh đăng
    
2. Cách chạy
    B1. cài đặt môi trường npm (v16) và node (v8)
    B2. npm install
    B3. npm run youtube
    
3. Kết quả trả về
    File json
    {
        "data": [
            {
            "videoTitle": "Nhạc Lofi 2022 - Những Bản Nhạc Lofi Chill Nhẹ Nhàng Hay Nhất - Nhạc Trẻ Lofi Chill Hay Nhất 2022",
            "linkVideo": "https://www.youtube.com/watch?v=2h6uajmjSk8",
            "viewCount": 3148443,
            "likeCount": 11694,
            "dislikeCount": null,
            "commentCount": 427,
            "channelName": "Cryz T",
            "subscribers": 19800,
            "linkChannel": "https://www.youtube.com/channel/UCD9fZ835fHVhAoK_I6t-CoQ"
            },
            {
            "videoTitle": "Thám Tử Lừng Danh Conan - Tập 563 - Chân tướng của truyền thuyết đô thị (Phần 2) - Trọn Bộ Conan",
            "linkVideo": "https://www.youtube.com/watch?v=psEiT_fm2Jc",
            "viewCount": 110255,
            "likeCount": 3743,
            "dislikeCount": null,
            "commentCount": 103,
            "channelName": "POPS Anime",
            "subscribers": 4930000,
            "linkChannel": "https://www.youtube.com/channel/UCkgdDBHO7zl3tWIjldQeK7g"
            },
            {.......},
            {
            "videoTitle": "♪ [ Playlist ] List tổng hợp nhạc Trung buồn, tâm trạng hay nhất - Vương Tĩnh Văn Không Mập.",
            "linkVideo": "https://www.youtube.com/watch?v=J9bELEHdym8",
            "viewCount": 322396,
            "likeCount": 4219,
            "dislikeCount": null,
            "commentCount": 56,
            "channelName": "Nhược Vũ - 若雨",
            "subscribers": 1400,
            "linkChannel": "https://www.youtube.com/channel/UCsF9pUCY_NuAXPGJ_TkfuNw"
            }
        ],
        "totalResults": 500
    }