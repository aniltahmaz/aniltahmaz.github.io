// ── Card videos: the cards on screen play by themselves; the ones further down
//    only start downloading once they are scrolled into view ──
var cardVideos = (function() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('.card-video video'));
    var inView = [];
    var held = false;

    function play(v) { v.play().catch(function() {}); }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                var v = entry.target;
                var i = inView.indexOf(v);
                if (entry.isIntersecting) {
                    if (i === -1) inView.push(v);
                    if (!held) play(v);
                } else {
                    if (i !== -1) inView.splice(i, 1);
                    v.pause();
                }
            });
        }, { threshold: 0.2 });

        videos.forEach(function(v) { observer.observe(v); });
    } else {
        inView = videos.slice();
        videos.forEach(play);
    }

    return {
        // While a project is open, the cards behind it stop
        hold: function() {
            held = true;
            videos.forEach(function(v) { v.pause(); });
        },
        release: function() {
            held = false;
            inView.forEach(play);
        }
    };
})();

// ── Project Detail Modal ───────────────────────────────────────
(function() {
    var modal = document.getElementById('project-modal');
    var modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    var modalContainer = modal.querySelector('.modal-container');
    var defaultTitle = document.title;
    var currentCard = null;

    function openModal(card) {
        var template = card.querySelector('.project-detail-template');
        if (!template) return;

        currentCard = card;
        var cardTitle = card.querySelector('.card-summary h3');
        if (cardTitle) document.title = cardTitle.textContent + ' | Anil Tahmaz';

        modalContent.innerHTML = '';
        modalContent.appendChild(template.content.cloneNode(true));

        modal.hidden = false;
        // Force reflow so the transition runs from opacity 0
        void modal.offsetWidth;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        cardVideos.hold();

        // Restart videos inside the modal
        modalContent.querySelectorAll('video:not([data-lazy-video])').forEach(function(v) {
            try { v.currentTime = 0; v.play().catch(function() {}); } catch (e) {}
        });

        modalContainer.scrollTop = 0;
        watchLazyVideos();
        buildSectionNav();
        buildCaseEnd(card);

        modal.querySelector('.modal-close').focus();
    }

    // ── End of a project: back to the list, or on to the next project ──
    function buildCaseEnd(card) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.project-card'));
        var next = cards[(cards.indexOf(card) + 1) % cards.length];
        var body = modalContent.querySelector('.modal-body');
        if (!body || next === card) return;

        var end = document.createElement('div');
        end.className = 'case-end';

        var all = document.createElement('button');
        all.type = 'button';
        all.className = 'case-end-all';
        all.textContent = '← All projects';
        all.addEventListener('click', leaveProject);

        var link = document.createElement('a');
        link.className = 'case-end-next';
        link.href = '#project/' + next.dataset.projectId;
        var label = document.createElement('span');
        label.textContent = 'Next project';
        var title = document.createElement('strong');
        title.textContent = next.querySelector('.card-summary h3').textContent + ' →';
        link.appendChild(label);
        link.appendChild(title);
        link.addEventListener('click', function(e) {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            showProject(next, true);
        });

        end.appendChild(all);
        end.appendChild(link);
        body.appendChild(end);
    }

    // ── Contents: one button per section, for details marked data-section-nav.
    //    Wide screens show them in a rail in the gap left of the panel, narrower ones in a bar inside it ──
    var sectionRail = document.getElementById('section-rail');
    var sectionNav = null;
    var navItems = [];
    var navCurrent = null;
    var navTicking = false;

    function navLabel(className) {
        var label = document.createElement('span');
        label.className = className;
        label.textContent = 'Contents';
        return label;
    }

    function clearSectionNav() {
        sectionNav = null;
        navItems = [];
        navCurrent = null;
        sectionRail.hidden = true;
        sectionRail.innerHTML = '';
    }

    function buildSectionNav() {
        clearSectionNav();

        var details = modalContent.querySelector('.modal-details[data-section-nav]');
        if (!details) return;

        // Short projects need no list of contents
        var sections = details.querySelectorAll('section.iteration');
        if (sections.length < 4) return;

        var nav = document.createElement('nav');
        nav.className = 'section-nav';
        nav.setAttribute('aria-label', 'Sections');
        nav.appendChild(navLabel('section-nav-label'));
        sectionRail.appendChild(navLabel('section-rail-label'));

        sections.forEach(function(section) {
            var name = section.querySelector('.section-name, .iteration-date');
            if (!name) return;

            var buttons = [nav, sectionRail].map(function(parent) {
                var btn = document.createElement('button');
                btn.type = 'button';
                if (parent === sectionRail) {
                    // The rail can show the number alone, so the name is its own element
                    var text = document.createElement('span');
                    text.className = 'rail-text';
                    text.textContent = name.textContent;
                    btn.appendChild(text);
                    btn.setAttribute('aria-label', name.textContent);
                } else {
                    btn.textContent = name.textContent;
                }
                btn.addEventListener('click', function() { scrollToSection(section); });
                parent.appendChild(btn);
                return btn;
            });
            navItems.push({ section: section, buttons: buttons });
        });

        details.insertBefore(nav, sections[0]);
        sectionNav = nav;
        sectionRail.hidden = false;
        updateSectionNav();
    }

    function scrollToSection(section) {
        var top = section.getBoundingClientRect().top - modalContainer.getBoundingClientRect().top + modalContainer.scrollTop;
        modalContainer.scrollTo({ top: top - sectionNav.offsetHeight - 10, behavior: 'smooth' });
    }

    // Highlight the section that is currently at the top of the panel
    function updateSectionNav() {
        navTicking = false;
        if (!sectionNav) return;

        var line = modalContainer.getBoundingClientRect().top + sectionNav.offsetHeight + 24;
        var current = null;
        navItems.forEach(function(item) {
            if (item.section.getBoundingClientRect().top <= line) current = item;
        });
        // A short last section never reaches the top: at the end of the panel it is the current one
        if (modalContainer.scrollTop + modalContainer.clientHeight >= modalContainer.scrollHeight - 2) current = navItems[navItems.length - 1];
        if (current === navCurrent) return;

        navCurrent = current;
        navItems.forEach(function(item) {
            item.buttons.forEach(function(btn) { btn.classList.toggle('active', item === current); });
        });
        if (current) sectionNav.scrollTo({ left: Math.max(0, current.buttons[0].offsetLeft - 90), behavior: 'smooth' });
    }

    modalContainer.addEventListener('scroll', function() {
        if (!sectionNav || navTicking) return;
        navTicking = true;
        requestAnimationFrame(updateSectionNav);
    });

    // Clips further down the modal only download and play once scrolled into view
    var lazyVideoObserver = null;

    function watchLazyVideos() {
        if (lazyVideoObserver) lazyVideoObserver.disconnect();

        var clips = modalContent.querySelectorAll('video[data-lazy-video]');
        if (!clips.length) return;

        if (!('IntersectionObserver' in window)) {
            clips.forEach(function(v) { v.play().catch(function() {}); });
            return;
        }

        lazyVideoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) entry.target.play().catch(function() {});
                else entry.target.pause();
            });
        }, { root: modal.querySelector('.modal-container'), threshold: 0.25 });

        clips.forEach(function(v) { lazyVideoObserver.observe(v); });
    }

    function closeModal() {
        if (!modal.classList.contains('open')) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.title = defaultTitle;
        currentCard = null;
        sectionNav = null;
        closeLightbox();
        cardVideos.release();

        // Pause videos so they don't keep streaming in background
        if (lazyVideoObserver) lazyVideoObserver.disconnect();
        modalContent.querySelectorAll('video').forEach(function(v) {
            try { v.pause(); } catch (e) {}
        });

        // Wait for CSS transition before hiding & clearing content
        setTimeout(function() {
            if (!modal.classList.contains('open')) {
                modal.hidden = true;
                modalContent.innerHTML = '';
                clearSectionNav();
            }
        }, 260);
    }

    // ── Each project has its own address (#project/<id>): it can be linked to,
    //    opened in a new tab, and closed with the browser's Back button ──
    function cardFromAddress() {
        var match = /^#project\/([\w-]+)$/.exec(location.hash);
        return match ? document.querySelector('.project-card[data-project-id="' + match[1] + '"]') : null;
    }

    function syncModalToAddress() {
        var card = cardFromAddress();
        if (!card) closeModal();
        else if (card !== currentCard) openModal(card);
    }

    // Moving on from an open project replaces its address instead of adding one,
    // so Back and the close button still return to the list
    function showProject(card, replace) {
        if (card === currentCard) return;
        var address = '#project/' + card.dataset.projectId;
        if (replace) history.replaceState(history.state && history.state.project ? { project: card.dataset.projectId } : null, '', address);
        else history.pushState({ project: card.dataset.projectId }, '', address);
        openModal(card);
    }

    function leaveProject() {
        if (!modal.classList.contains('open')) return;

        // Opened from this page: Back returns to it. Opened by its address: clear the address
        if (history.state && history.state.project) {
            history.back();
        } else {
            history.replaceState(null, '', location.pathname + location.search);
            closeModal();
        }
    }

    window.addEventListener('popstate', syncModalToAddress);
    window.addEventListener('hashchange', syncModalToAddress);

    // Open: a plain click on a card. The middle button and modified clicks follow the link instead
    document.querySelectorAll('.card-trigger').forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            var card = link.closest('.project-card');
            if (!card) return;
            e.preventDefault();
            showProject(card);
        });
    });

    // Open: anything with [data-open-project="<id>"] anywhere in the page
    document.addEventListener('click', function(e) {
        var trigger = e.target.closest('[data-open-project]');
        if (!trigger) return;
        var id = trigger.dataset.openProject;
        if (!id) return;
        e.preventDefault();
        var card = document.querySelector('.project-card[data-project-id="' + id + '"]');
        if (card) showProject(card);
    });

    // Close: backdrop + close button (anything with data-close)
    modal.addEventListener('click', function(e) {
        if (e.target.closest('[data-close]')) leaveProject();
    });

    // ── Image lightbox: design figures zoom in place, over the modal ──
    var lightbox = document.getElementById('image-lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxOrigin = null;

    function isLightboxOpen() {
        return lightbox && !lightbox.hidden;
    }

    function openLightbox(link) {
        var thumb = link.querySelector('img');
        var caption = link.parentElement.querySelector('figcaption');

        lightboxImg.src = link.href;
        lightboxImg.alt = thumb ? thumb.alt : (link.dataset.alt || '');
        lightboxCaption.textContent = link.dataset.caption || (caption ? caption.textContent : '');

        lightboxOrigin = link;
        lightbox.hidden = false;
        lightbox.querySelector('.lightbox-close').focus();
    }

    function closeLightbox() {
        if (!isLightboxOpen()) return;
        lightbox.hidden = true;
        lightboxImg.removeAttribute('src');
        if (lightboxOrigin) lightboxOrigin.focus();
        lightboxOrigin = null;
    }

    if (lightbox) {
        // Open: clicking a design figure, or a text link marked data-lightbox, inside the modal
        modalContent.addEventListener('click', function(e) {
            var link = e.target.closest('.design-figure a, a[data-lightbox]');
            if (!link) return;
            e.preventDefault();
            openLightbox(link);
        });

        // Close: anywhere outside the image itself
        lightbox.addEventListener('click', function(e) {
            if (e.target !== lightboxImg) closeLightbox();
        });
    }

    // Close: ESC key — the lightbox first, then the modal
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        if (isLightboxOpen()) closeLightbox();
        else leaveProject();
    });

    // Arriving by a project's address opens that project
    syncModalToAddress();
})();
