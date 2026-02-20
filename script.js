/* ── Tab Switching for Project Cards ── */
function switchTab(projectId, tabName, btn) {
    var wrapper = document.getElementById(projectId);

    wrapper.querySelectorAll('.tab-panel').forEach(function(panel) {
        panel.classList.remove('active');
    });

    wrapper.querySelector('[data-tab="' + tabName + '"]')
           .classList.add('active');

    btn.closest('.tabs').querySelectorAll('.tab').forEach(function(t) {
        t.classList.remove('active');
    });
    btn.classList.add('active');
}

/* ── Technical Highlights Toggle ── */
function selectHighlight(item) {
    var allItems = document.querySelectorAll('.tech-hl-item');
    var detail = document.getElementById('tech-detail');
    var detailText = document.getElementById('tech-detail-text');
    var detailTitle = document.getElementById('tech-detail-title');
    var detailIcon = document.getElementById('tech-detail-icon');

    // If clicking the already active one, close it
    if (item.classList.contains('active')) {
        item.classList.remove('active');
        detail.classList.remove('open');
        return;
    }

    // Remove active from all
    allItems.forEach(function(other) {
        other.classList.remove('active');
    });

    // Activate clicked
    item.classList.add('active');

    // Update shared detail area
    detailIcon.textContent = item.dataset.icon;
    detailTitle.textContent = item.dataset.title;
    detailText.textContent = item.dataset.detail;
    detail.classList.add('open');
}