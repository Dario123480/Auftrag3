const { minify } = require('html-minifier');
const CleanCSS = require('clean-css');
const fs = require('fs-extra');
const { rimrafSync } = require('rimraf');

const DIST_DIR = './docs';
const ASSETS_DIR = './assets';
const CSS_FILE = 'style.css';
const HTML_FILES = [
    'index.html',
    'about.html',
    'produkte.html',
    'login.html',
    'password-forgot.html',
    'contact.html'
];

function resetDist() {
    if (fs.existsSync(DIST_DIR)) {
        rimrafSync(DIST_DIR);
    }

    fs.mkdirSync(DIST_DIR, { recursive: true });
}

function copyAssets() {
    if (!fs.existsSync(ASSETS_DIR)) {
        console.warn(`[build] Skip asset copy: '${ASSETS_DIR}' not found.`);
        return;
    }

    fs.copySync(ASSETS_DIR, `${DIST_DIR}/assets`);
}

function writeMinifiedCss() {
    if (!fs.existsSync(CSS_FILE)) {
        throw new Error(`[build] Missing '${CSS_FILE}'. Run Sass before minifying.`);
    }

    const css = fs.readFileSync(CSS_FILE, 'utf8');
    const result = new CleanCSS({ level: 2 }).minify(css);

    if (result.errors.length) {
        throw new Error(`[build] CSS minify failed: ${result.errors.join(', ')}`);
    }

    if (result.warnings.length) {
        console.warn(`[build] CSS minify warnings: ${result.warnings.join(', ')}`);
    }

    fs.writeFileSync(`${DIST_DIR}/${CSS_FILE}`, result.styles);
}

function writeMinifiedHtml() {
    HTML_FILES.forEach((file) => {
        if (!fs.existsSync(file)) {
            console.warn(`[build] Skip '${file}': file not found.`);
            return;
        }

        const content = fs.readFileSync(file, 'utf8');
        const result = minify(content, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            removeAttributeQuotes: true
        });

        fs.writeFileSync(`${DIST_DIR}/${file}`, result);
    });
}

function runTask() {
    console.log('[build] Starting optimized build...');
    resetDist();
    copyAssets();
    writeMinifiedCss();
    writeMinifiedHtml();
    console.log(`[build] Finished successfully in ${DIST_DIR}`);
}

try {
    runTask();
} catch (error) {
    console.error('[build] Failed.');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
