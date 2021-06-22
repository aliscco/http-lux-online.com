'use strict';

const {
    FEATURE_CREATED,
    FEATURE_UPDATED,
    FEATURE_ARCHIVED,
    FEATURE_REVIVED,
    FEATURE_IMPORT,
    DROP_FEATURES,
} = require('../../event-type');
const NotFoundError = require('../../error/notfound-error');

const store = new Map();

class FeatureToggleStore {
    constructor(eventStore) {
        eventStore.on(FEATURE_CREATED, event =>
            this._createFeature(event.data)
        );
        eventStore.on(FEATURE_UPDATED, event =>
            this._updateFeature(event.data)
        );
        eventStore.on(FEATURE_ARCHIVED, event =>
            this._archiveFeature(event.data)
        );
        eventStore.on(FEATURE_REVIVED, event =>
            this._reviveFeature(event.data)
        );
        eventStore.on(FEATURE_IMPORT, event => this._importFeature(event.data));
        eventStore.on(DROP_FEATURES, () => this._dropFeatures());
    }

    getFeatures() {
        const toggles = [...store.values()].filter(t => !t.archived);
        return Promise.resolve(toggles);
    }

    getFeature(name) {
        const toggle = store.get(name);
        if (toggle && !toggle.archived) {
            const copy = Object.assign({}, toggle);
            return Promise.resolve(copy);
        } else {
            return Promise.reject(new NotFoundError('No feature toggle found'));
        }
    }

    hasFeature(name) {
        const toggle = store.get(name);
        if (toggle) {
            return Promise.resolve({
                name: toggle.name,
                archived: toggle.archived,
            });
        } else {
            return Promise.reject(new NotFoundError('No feature toggle found'));
        }
    }

    getArchivedFeatures() {
        const toggles = [...store.values()].filter(t => t.archived);
        return Promise.resolve(toggles);
    }

    _createFeature(data) {
        const copy = Object.assign({}, data);
        store.set(data.name, copy);
    }

    _updateFeature(data) {
        const copy = Object.assign({}, data);
        store.set(data.name, copy);
    }

    _archiveFeature({ name }) {
        const toggle = store.get(name);
        toggle.archived = true;
        store.set(name, toggle);
    }

    _reviveFeature({ name }) {
        const toggle = store.get(name);
        toggle.archived = true;
        toggle.enabled = false;
        store.set(name, toggle);
    }

    _importFeature(data) {
        store.set(data.name, data);
    }

    _dropFeatures() {
        store.clear();
    }
}

module.exports = FeatureToggleStore;
