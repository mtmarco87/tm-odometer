const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

// Get the dist folder name by removing -lib suffix
const pkgName = pkg.name.replace(/-lib$/, '');
const distPath = path.join('dist', pkgName);

// Get command from arguments
const command = process.argv[2] || 'help';

// Make sure the dist folder exists
function checkDistFolder() {
    if (!fs.existsSync(distPath)) {
        console.log(`Building package first...`);
        execSync('npm run build', { stdio: 'inherit' });
    }

    if (!fs.existsSync(distPath)) {
        console.error(`Error: ${distPath} directory not found after build`);
        process.exit(1);
    }
}

// Run a command in the dist folder
function runInDist(cmd) {
    console.log(`Running '${cmd}' in ${distPath}...`);
    return execSync(cmd, { cwd: distPath, stdio: 'inherit' });
}

// Process based on command
switch (command) {
    case 'publish':
        checkDistFolder();
        runInDist('npm publish --access public');
        break;

    case 'pack':
        checkDistFolder();
        runInDist('npm pack');

        // Copy the tarball to the root
        const tarballName = `${pkgName}-${pkg.version}.tgz`;
        const tarballPath = path.join(distPath, tarballName);

        if (fs.existsSync(tarballPath)) {
            fs.copyFileSync(tarballPath, tarballName);
            fs.unlinkSync(tarballPath);
            console.log(`Package tarball copied to ./${tarballName}`);
        }
        break;

    case 'link':
        checkDistFolder();
        runInDist('npm link');
        console.log(`Package linked: ${pkgName}`);
        break;

    default:
        console.log('Usage: node scripts/npm-utils.js [publish|pack|link]');
        break;
}