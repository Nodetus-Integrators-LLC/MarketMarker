document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveButton');
    const titleInput = document.getElementById('titleInput');
    const bookmarkList = document.getElementById('bookmarkList');

    // Load and display existing bookmarks
    loadBookmarks();

    // Save bookmark when the button is clicked
    saveButton.addEventListener('click', saveBookmark);

    function saveBookmark() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];
            const title = titleInput.value.trim() || currentTab.title;
            const url = currentTab.url;
            const dateAdded = new Date().toISOString();

            const bookmark = { title, url, dateAdded };

            chrome.storage.local.get({ bookmarks: [] }, function (result) {
                const bookmarks = result.bookmarks;
                bookmarks.push(bookmark);
                chrome.storage.local.set({ bookmarks: bookmarks }, function () {
                    console.log('Bookmark saved');
                    titleInput.value = '';
                    loadBookmarks();
                });
            });
        });
    }

    function loadBookmarks() {
        chrome.storage.local.get({ bookmarks: [] }, function (result) {
            const bookmarks = result.bookmarks;
            bookmarkList.innerHTML = '';
            bookmarks.forEach(function (bookmark) {
                const li = document.createElement('li');
                li.textContent = `${bookmark.title} (${new Date(bookmark.dateAdded).toLocaleDateString()})`;
                li.title = bookmark.url;
                li.addEventListener('click', function () {
                    chrome.tabs.create({ url: bookmark.url });
                });
                bookmarkList.appendChild(li);
            });
        });
    }
});