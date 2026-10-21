/* LWN 周刊 - 目录（scrollspy）
 * 从页首 .toc 目录构建右侧悬浮面板：
 * - 宽屏（>=1760px）常驻显示；窄屏通过右下角按钮开合
 * - 滚动时高亮当前章节（悬浮面板与页首目录同步）
 * - 点击目录项平滑跳转，窄屏下点击后自动收起面板
 */
(function () {
    'use strict';

    var toc = document.querySelector('.toc');
    if (!toc) return;

    var links = Array.prototype.slice.call(toc.querySelectorAll('ul li a[href^="#"]'));
    if (!links.length) return;

    /* 构建悬浮面板 */
    var panel = document.createElement('nav');
    panel.className = 'toc-float';
    panel.setAttribute('aria-label', '目录');

    var title = document.createElement('h2');
    title.textContent = '📑 目录';
    panel.appendChild(title);

    var ul = document.createElement('ul');
    var floatLinks = links.map(function (a) {
        var li = document.createElement('li');
        var na = document.createElement('a');
        na.href = a.getAttribute('href');
        na.textContent = a.textContent;
        li.appendChild(na);
        ul.appendChild(li);
        return na;
    });
    panel.appendChild(ul);
    document.body.appendChild(panel);

    /* 窄屏开关按钮 */
    var btn = document.createElement('button');
    btn.className = 'toc-float-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', '打开目录');
    btn.textContent = '📑';
    document.body.appendChild(btn);

    function closePanel() { panel.classList.remove('open'); }

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        panel.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
        if (panel.classList.contains('open') && !panel.contains(e.target) && !btn.contains(e.target)) {
            closePanel();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closePanel();
    });

    /* 滚动定位高亮 */
    var targets = links.map(function (a) {
        return document.getElementById(a.getAttribute('href').slice(1));
    });

    var OFFSET = 140; /* 视口顶部以下多少像素内算“已进入” */

    function current() {
        var idx = 0;
        for (var i = 0; i < targets.length; i++) {
            if (targets[i] && targets[i].getBoundingClientRect().top <= OFFSET) {
                idx = i;
            }
        }
        return idx;
    }

    var ticking = false;
    function update() {
        ticking = false;
        var idx = current();
        links.forEach(function (a, i) { a.classList.toggle('active', i === idx); });
        floatLinks.forEach(function (a, i) { a.classList.toggle('active', i === idx); });

        /* 面板可见时，让当前项滚动到面板中部 */
        var act = floatLinks[idx];
        var panelVisible = panel.classList.contains('open') || window.innerWidth >= 1760;
        if (act && panelVisible) {
            var top = act.offsetTop - panel.clientHeight / 2 + act.offsetHeight;
            panel.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
    }

    floatLinks.forEach(function (na) {
        na.addEventListener('click', closePanel);
    });

    window.addEventListener('scroll', function () {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
})();
