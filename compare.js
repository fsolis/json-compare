const fs = require('fs');

// Creates a file with a given name and outputs content to file
function createFile(name, content) {
    try {
        fs.writeFileSync(name, JSON.stringify(content, null, 2));
        console.log('File created: ', name);
    } catch (e) {
        console.log('Error Writing Results To File.');
    }
}

// Gets content of a given JSON file
function getFile(name) {
    try {
        const rawFileContent = fs.readFileSync(name);

        return JSON.parse(rawFileContent);
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Checks to see if correct names were given through
// arguments
function getFileNames() {
    const args = process.argv;

    if (!(args[2] && args[3])) {
        console.error('Invalid params');
        return [];
    }

    return [args[2], args[3]];
}

// Checks to see if an given object has no properties
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Adds a given key to an object w/ the current path
function addKeysToObj(obj, diff, path) {
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            console.log(obj, diff, path);
            addKeysToObj(obj[key], diff, path + (path === '' ? '' : '.') + key);
        } else {
            diff[path + (path === '' ? '' : '.') + key] = obj[key];
        }
    }
}

// Searches through old and current objects and finds
// differences between them
function findChanges(old, current, changes, path) {
    if (isEmpty(old) || isEmpty(current)) return;

    for (const key in old) {
        if (current[key]) {
            if (typeof current[key] === 'object' && typeof old[key] === 'object') {
                findChanges(old[key], current[key], changes, path + (path === '' ? '' : '.') + key);
            } else if (current[key] !== old[key]) {
                console.log(path, key);
                changes[path + (path === '' ? '' : '.') + key] = current[key];
            }
        }
    }
}

function findMissing(old, current, missing, path) {
    if (isEmpty(old) || isEmpty(current)) return;

    for (const key in old) {
        if (!current[key]) {
            if (typeof old[key] === 'object') {
                addKeysToObj(old[key], missing, path);
            } else {
                missing[path + (path === '' ? '' : '.') + key] = old[key];
            }
        } else if (typeof old[key] === 'object') {
            if (typeof current[key] !== 'object') {
                missing[path + (path === '' ? '' : '.') + key] = '';
            } else {
                findMissing(old[key], current[key], missing, path + (path === '' ? '' : '.') + key);
            }
        }
    }
}

function main() {
    const [oldFileName, newFileName] = getFileNames();

    if (!(oldFileName, newFileName)) return;


    // Get file contents
    const oldFile = getFile(oldFileName);
    const newFile = getFile(newFileName);

    // If opening either files fails, then we exit
    if (!(oldFile && newFile)) {
        console.error('Could not open files', oldFile, newFile);
        return;
    }

    console.log('Starting Comparison');

    const additions = {};
    const changes = {};
    const removed = {};

    findChanges(oldFile, newFile, changes, '');
    findMissing(newFile, oldFile, additions, '');
    findMissing(oldFile, newFile, removed, '');

    createFile('results.json', {
        changes,
        additions,
        removed,
    });

    console.log('Comparison Done!');
}

main();