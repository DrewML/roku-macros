const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { promisify: pify } = require('util');

class MacroDB {
    constructor({ dbPath } = {}) {
        assert(dbPath, 'Path to db required');
        assert(path.isAbsolute(dbPath), 'Path to db must be an absolute path');
        this.dbPath = dbPath;
        try {
            this.db = require(dbPath);
        } catch (err) {
            this.db = {
                savedMacros: {}
            };
        }
    }

    save() {
        return pify(fs.writeFile)(
            this.dbPath,
            JSON.stringify(this.db, null, 4)
        );
    }

    exists(name) {
        return !!this.db.savedMacros[name];
    }

    delete(name) {
        this.db.savedMacros[name] = null;
    }

    add(name, macro) {
        this.db.savedMacros[name] = macro;
        return this.save();
    }

    get(name) {
        return this.db.savedMacros[name];
    }
}

module.exports = MacroDB;
