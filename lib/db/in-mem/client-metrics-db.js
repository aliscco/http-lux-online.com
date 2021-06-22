'use strict';

class ClientMetricsDb {
    constructor() {}

    // Insert new client metrics
    insert() {
        return Promise.resolve();
    }

    // Used at startup to load all metrics last week into memory!
    getMetricsLastHour() {
        return Promise.resolve([]);
    }

    // Used to poll for new metrics
    getNewMetrics() {
        return Promise.resolve([]);
    }
}

module.exports = ClientMetricsDb;
