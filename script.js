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

function selectHighlight(item) {
    var allItems = document.querySelectorAll('.tech-hl-item');
    var detail = document.getElementById('tech-detail');
    var detailText = document.getElementById('tech-detail-text');
    var detailTitle = document.getElementById('tech-detail-title');
    var detailIcon = document.getElementById('tech-detail-icon');

    if (item.classList.contains('active')) {
        item.classList.remove('active');
        detail.classList.remove('open');
        return;
    }

    allItems.forEach(function(other) {
        other.classList.remove('active');
    });

    item.classList.add('active');

    detailIcon.textContent = item.dataset.icon;
    detailTitle.textContent = item.dataset.title;
    detailText.textContent = item.dataset.detail;
    detail.classList.add('open');
}