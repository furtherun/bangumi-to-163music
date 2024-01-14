// ==UserScript==
// @name         bangumi音乐原声集跳转网易云专辑
// @namespace    https://github.com/furtherun/bangumi-to-163music
// @version      0.0.2
// @description  填写网易云专辑页面id，点击“网易云”按钮进行跳转。如果没有设置id，则搜索专辑名。
// @description  设置页面增加专辑表，记录已经绑定的音乐专辑，也可以录入绑定关系。
// @author       furtherun
// @match        http*://bgm.tv/*
// @match        http*://chii.in/*
// @match        http*://bangumi.tv/*
// @grant        none
// ==/UserScript==

let style = document.createElement('style');
style.textContent = `
    .jump_button {
        cursor: pointer;
        background-color: #fefefe;
        color: black;
        border-radius: 20px; 
        padding: 4px 14px;
        transition: background-color 0.3s, color 0.3s;
        border: 1px solid lightgray; 
    }
    .jump_button:hover {
        background-color: #72acde;
        color: white;
    }
    .jump_input {
        width: 100px;
        margin-right: 10px;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 0 5px rgba(0,0,0,.1);
    }
`;
document.head.appendChild(style);

(function () {

    let menu = document.querySelector("#navMenuNeue .focus.chl");
    // 检查subject是否为音乐类型
    if (menu && menu.href.split("/")[3] === "music") {

        const h1 = document.querySelector('h1.nameSingle');

        const navTabs = document.querySelector('.navTabs');
        const li = document.createElement('li');

        const input = document.createElement('input');
        input.classList.add('jump_input');
        input.type = 'number';
        input.placeholder = 'album id';
        input.value = getAlbumId();

        const button = document.createElement('button');
        button.classList.add('jump_button');
        button.textContent = '网易云';

        button.addEventListener('mouseover', () => {
            const id = input.value.trim();
            if (id) {
                button.title = '跳转到专辑……';
            } else {
                button.title = '在网易云中搜索';
            }
        });

        button.addEventListener('click', () => {
            const id = input.value.trim();
            if (id) {
                setAlbumId(id);
                window.open(`https://music.163.com/#/album?id=${id}`);
            } else {
                window.open(`https://music.163.com/#/search/m/?s=${encodeURIComponent(h1.textContent.trim())}&type=10`);
            }
        });

        li.appendChild(input);
        li.appendChild(button);
        navTabs.appendChild(li);

        function getAlbumId() {
            const match = location.pathname.match(/^\/subject\/(\d+)/);
            if (match) {
                let bgm_albums = JSON.parse(localStorage.getItem('bgm_music_albums')) || {};
                return bgm_albums[match[1]] || '';
            }
            return '';
        }

        function setAlbumId(id) {
            const match = location.pathname.match(/^\/subject\/(\d+)/);
            if (match) {
                let bgm_albums = JSON.parse(localStorage.getItem('bgm_music_albums')) || {};
                bgm_albums[match[1]] = id;
                localStorage.setItem('bgm_music_albums', JSON.stringify(bgm_albums));
            }
        }

    }

    // 在设置页面
    if (document.location.href.match(/settings/)) {
        $("#header > ul").append('<li><a id="bgm_albums" href="javascript:void(0);"><span>专辑</span></a></li>');
        $("#bgm_albums").on("click", function () {
            $("#header").find("[class='selected']").removeClass("selected");
            $("#bgm_albums").addClass("selected");

            let bgm_albums = JSON.parse(localStorage.getItem('bgm_music_albums')) || {};

            let data = "";


            for (let subject_id in bgm_albums) {
                data += `${subject_id}, ${bgm_albums[subject_id]}\n`;
            }

            let html = '<form>' +
                '<span class="text">以下是你所保存的专辑，你可以<strong>按行</strong>编辑和替换，确认无误后点击“保存修改”。</span>' + '<br></br>' +
                '<span class="text">每一行的格式为<code>"music_subject_id", "album_id"</code>，慎重操作。</span>' +
                '<textarea id="data_content" name="content" cols="45" rows="15" style="width: 1000px;" class="quick">' + data + '</textarea>' +
                '<input id="saveBtn" class="inputBtn" value="保存修改" readonly unselectable="on" style="width:52px">' +
                '<input id="copyBtn" class="inputBtn" value="一键复制" readonly unselectable="on" style="width:52px; margin-left: 10px">' +
                '<a id="alert_submit" style="color: #F09199; font-size: 14px; padding: 20px"></a>' +
                '</form>';
            $("#columnA").html(html);

            $("#saveBtn").on("click", function () {
                data = $("#data_content").attr("value");
                let lines = data.split('\n').filter(line => line.trim() !== '');
                let music_albums = {};

                for (let line of lines) {
                    let [subject_id, album_id] = line.split(/,\s*/);
                    music_albums[subject_id.trim()] = album_id.trim();
                }

                localStorage.setItem('bgm_music_albums', JSON.stringify(music_albums));

                alert('保存成功！');
            });

            $("#copyBtn").on("click", function () {
                let copyText = document.querySelector("#data_content").value;
                navigator.clipboard.writeText(copyText).then(function () {
                    alert("复制成功！");
                }, function (err) {
                    alert('复制失败：', err);
                });
            });
        });
    }

})();
