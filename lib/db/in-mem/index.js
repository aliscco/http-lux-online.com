'use strict';

const EventStore = require('./event-store');
const FeatureToggleStore = require('./feature-toggle-store');
const StrategyStore = require('./strategy-store');
const ClientInstanceStore = require('./client-instance-store');
const ClientMetricsDb = require('./client-metrics-db');
const ClientMetricsStore = require('./client-metrics-store');
const ClientApplicationsStore = require('./client-applications-store');
const { STRATEGY_CREATED } = require('../../event-type');

class InMemoryStore {
    constructor() {
        this.eventStore = new EventStore();
        this.clientMetricsDb = new ClientMetricsDb();
        this.featureToggleStore = new FeatureToggleStore(this.eventStore);
        this.strategyStore = new StrategyStore(this.eventStore);
        this.clientApplicationsStore = new ClientApplicationsStore();
        this.clientInstanceStore = new ClientInstanceStore();
        this.clientMetricsStore = new ClientMetricsStore(this.clientMetricsDb);
    }

    getStores() {
        return {
            eventStore: this.eventStore,
            featureToggleStore: this.featureToggleStore,
            strategyStore: this.strategyStore,
            clientApplicationsStore: this.clientApplicationsStore,
            clientInstanceStore: this.clientInstanceStore,
            clientMetricsStore: this.clientMetricsStore,
        };
    }

    migrate() {
        this.eventStore.store({
            type: STRATEGY_CREATED,
            createdAt: new Date(),
            data: {
                name: 'default',
                builtIn: true,
            },
        });
    }
}

module.exports = InMemoryStore;
