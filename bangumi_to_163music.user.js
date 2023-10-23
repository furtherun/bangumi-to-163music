// ==UserScript==
// @name         bangumi音乐原声集跳转网易云专辑
// @namespace    https://github.com/furtherun/bangumi-to-163music
// @version      0.0.1
// @description  设置网易云专辑页面id，点击“网易云”按钮进行跳转。如果没有设置id，则搜索专辑名。
// @author       furtherun
// @include      /^https?:\/\/(bgm\.tv|chii\.in|bangumi\.tv)\/subject\/\d+$/
// @grant        none
// ==/UserScript==

(function () {

    if (!document.querySelector('a.focus.chl[href="/music"]')) {
        return;
    }

    const h1 = document.querySelector('h1.nameSingle');

    const navTabs = document.querySelector('.navTabs');
    const li = document.createElement('li');

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'album id';
    input.style.width = '100px';
    input.style.marginRight = '10px';
    input.value = getAlbumId(); 

    const button = document.createElement('button');
    button.textContent = '网易云';
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
            const key = `albumId_${match[1]}`;
            return localStorage.getItem(key) || '';
        } else {
            return '';
        }
    }

    function setAlbumId(id) {
        const match = location.pathname.match(/^\/subject\/(\d+)/);
        if (match) {
            const key = `albumId_${match[1]}`;
            localStorage.setItem(key, id);
        }
    }

})();
