// src/js/services/BookmarkService.js
export class BookmarkService {
    static async createBookmark(data) {
        return new Promise((resolve, reject) => {
            chrome.bookmarks.create({
                parentId: data.parentId || '1',  // Default to bookmarks bar if no parent specified
                title: data.title,
                url: data.url,
                index: data.index
            }, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async getBookmarks(parentId = '1') {
        return new Promise((resolve) => {
            chrome.bookmarks.getChildren(parentId, (results) => {
                resolve(results || []);
            });
        });
    }

    static async searchBookmarks(query) {
        return new Promise((resolve) => {
            chrome.bookmarks.search(query, (results) => {
                resolve(results || []);
            });
        });
    }

    static async removeBookmark(id) {
        return new Promise((resolve, reject) => {
            chrome.bookmarks.remove(id, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    static async updateBookmark(id, changes) {
        return new Promise((resolve, reject) => {
            chrome.bookmarks.update(id, changes, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static async createBookmarkFolder(title, parentId = '1') {
        return new Promise((resolve, reject) => {
            chrome.bookmarks.create({
                parentId: parentId,
                title: title,
            }, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Helper method to create a market research folder structure
    static async createMarketResearchStructure() {
        try {
            // Create main folder
            const mainFolder = await this.createBookmarkFolder('Market Research');

            // Create subfolders
            const subfolders = [
                'Government Contracts',
                'Market Analysis',
                'Competitor Research',
                'Customer Requirements',
                'Technical Documentation'
            ];

            const folderStructure = await Promise.all(
                subfolders.map(folder =>
                    this.createBookmarkFolder(folder, mainFolder.id)
                )
            );

            return {
                mainFolder,
                subfolders: folderStructure
            };
        } catch (error) {
            console.error('Error creating bookmark structure:', error);
            throw error;
        }
    }
}