/* eslint camelcase:off */
'use strict';

class ClientApplicationsDb {
    constructor() {}

    updateRow() {
        return Promise.resolve();
    }

    insertNewRow() {
        return Promise.resolve();
    }

    upsert() {
        return Promise.resolve();
    }

    getAll() {
        return Promise.resolve([]);
    }

    getApplication(appName) {
        return Promise.resolve({ appName });
    }

    /**
     * Could also be done in SQL:
     * (not sure if it is faster though)
     *
     * SELECT app_name from (
     *   SELECT app_name, json_array_elements(strategies)::text as strategyName from client_strategies
     *   ) as foo
     * WHERE foo.strategyName = '"other"';
     */
    getAppsForStrategy() {
        return Promise.resolve([]);
    }

    getApplications() {
        return Promise.resolve([]);
    }
}

module.exports = ClientApplicationsDb;
