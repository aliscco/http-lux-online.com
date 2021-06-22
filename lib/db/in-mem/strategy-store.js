'use strict';

const {
    STRATEGY_CREATED,
    STRATEGY_DELETED,
    STRATEGY_UPDATED,
    STRATEGY_IMPORT,
    DROP_STRATEGIES,
} = require('../../event-type');
const NotFoundError = require('../../error/notfound-error');

const store = new Map();

class StrategyStore {
    constructor(eventStore) {
        eventStore.on(STRATEGY_CREATED, event =>
            this._createStrategy(event.data)
        );
        eventStore.on(STRATEGY_UPDATED, event =>
            this._updateStrategy(event.data)
        );
        eventStore.on(STRATEGY_DELETED, event =>
            this._deleteStrategy(event.data)
        );
        eventStore.on(STRATEGY_IMPORT, event =>
            this._importStrategy(event.data)
        );
        eventStore.on(DROP_STRATEGIES, () => this._dropStrategies());
    }

    getStrategies() {
        const strategies = [...store.values()];
        return Promise.resolve(strategies);
    }

    getEditableStrategies() {
        const strategies = [...store.values()].filter(s => !s.builtIn);
        return Promise.resolve(strategies);
    }

    getStrategy(name) {
        const strategy = store.get(name);
        if (strategy) {
            return Promise.resolve(strategy);
        } else {
            return Promise.reject(new NotFoundError('No strategy found'));
        }
    }

    eventDataToRow(data) {
        return {
            name: data.name,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
        };
    }

    _createStrategy(data) {
        console.log(`insert strategy ${data.name}`);
        store.set(data.name, data);
    }

    _updateStrategy(data) {
        store.set(data.name, data);
    }

    _deleteStrategy({ name }) {
        store.delete(name);
    }

    _importStrategy(data) {
        store.set(data.name, data);
    }

    _dropStrategies() {
        store.clear();
    }
}

module.exports = StrategyStore;
