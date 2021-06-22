/* eslint camelcase: "off" */
'use strict';

class ClientInstanceStore {
    constructor() {}

    updateRow() {
        return Promise.resolve();
    }

    insertNewRow() {
        return Promise.resolve();
    }

    insert() {
        return Promise.resolve();
    }

    getAll() {
        return Promise.resolve([]);
    }

    getByAppName(appName) {
        return Promise.resolve({ appName });
    }

    getApplications() {
        return Promise.resolve([]);
    }
}

module.exports = ClientInstanceStore;
