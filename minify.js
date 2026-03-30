const minify = require('html-minifier').minify;
const fs = require('fs-extra');
const { rimrafSync } = require('rimraf');

const dist = './docs';
const files = [
    'index.html', 
    'about.html', 
    'produkte.html', 
    'login.html', 
    'password-forgot.html', 
    'contact.html'
];

async function runTask() {
    if (fs.existsSync(dist)) {
        rimrafSync(dist);
    }
    
    fs.mkdirSync(dist);

    if (fs.existsSync('./assets')) {
        fs.copySync('./assets', `${dist}/assets`);
    }

    if (fs.existsSync('style.css')) {
        const css = fs.readFileSync('style.css', 'utf8');
        const minifiedCss = css.replace(/\s+/g, ' ').replace(/\/\*.*?\*\//g, '');
        fs.writeFileSync(`${dist}/style.css`, minifiedCss);
    }

    files.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const result = minify(content, {
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                removeAttributeQuotes: true
            });
            fs.writeFileSync(`${dist}/${file}`, result);
        }
    });

    console.log(`Build fertig in ${dist}`);
}

runTask();