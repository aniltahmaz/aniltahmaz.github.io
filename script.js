// ── Tech Highlights (about section) ────────────────────────────
function selectHighlight(item) {
    var allItems = document.querySelectorAll('.tech-hl-item');
    var detail = document.getElementById('tech-detail');
    var detailText = document.getElementById('tech-detail-text');
    var detailTitle = document.getElementById('tech-detail-title');
    var detailIcon = document.getElementById('tech-detail-icon');
    var projectLink = document.getElementById('tech-detail-project');

    if (item.classList.contains('active')) {
        item.classList.remove('active');
        detail.classList.remove('open');
        return;
    }

    allItems.forEach(function(other) { other.classList.remove('active'); });

    item.classList.add('active');
    detailIcon.textContent = item.dataset.icon;
    detailTitle.textContent = item.dataset.title;
    detailText.textContent = item.dataset.detail;

    if (item.dataset.project) {
        projectLink.dataset.openProject = item.dataset.project;
        projectLink.hidden = false;
    } else {
        projectLink.dataset.openProject = '';
        projectLink.hidden = true;
    }

    detail.classList.add('open');
}

// ── Project Detail Modal ───────────────────────────────────────
(function() {
    var modal = document.getElementById('project-modal');
    var modalContent = document.getElementById('modal-content');
    if (!modal || !modalContent) return;

    function openModal(card) {
        var template = card.querySelector('.project-detail-template');
        if (!template) return;

        modalContent.innerHTML = '';
        modalContent.appendChild(template.content.cloneNode(true));

        modal.hidden = false;
        // Force reflow so the transition runs from opacity 0
        void modal.offsetWidth;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Restart videos inside the modal
        modalContent.querySelectorAll('video:not([data-lazy-video])').forEach(function(v) {
            try { v.currentTime = 0; v.play(); } catch (e) {}
        });

        watchLazyVideos();

        modal.querySelector('.modal-close').focus();
    }

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
            }
        }, 260);
    }

    // Open: clicking any card-trigger
    document.querySelectorAll('.card-trigger').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var card = btn.closest('.project-card');
            if (card) openModal(card);
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
        if (card) openModal(card);
    });

    // Close: backdrop + close button (anything with data-close)
    modal.addEventListener('click', function(e) {
        if (e.target.closest('[data-close]')) closeModal();
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
        lightboxImg.alt = thumb ? thumb.alt : '';
        lightboxCaption.textContent = caption ? caption.textContent : '';

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
        // Open: clicking a design figure inside the modal
        modalContent.addEventListener('click', function(e) {
            var link = e.target.closest('.design-figure a');
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
        else closeModal();
    });
})();
