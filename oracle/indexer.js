const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.next'];
const TEXT_EXTS = ['.txt', '.md', '.js', '.jsx', '.json', '.html', '.css', '.py', '.c', '.cpp', '.h', '.cs', '.sh'];

function crawl(dir, index = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                crawl(fullPath, index);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            if (TEXT_EXTS.includes(ext)) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8').substring(0, 1000); // Index first 1000 chars
                    index.push({
                        name: file,
                        path: fullPath,
                        content: content,
                        ext: ext
                    });
                } catch (e) {
                    // Skip files that can't be read
                }
            }
        }
    }
    return index;
}

module.exports = { crawl };
