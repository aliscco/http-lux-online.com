'use strict';

const {
    INTEGRATION_CREATED,
    INTEGRATION_UPDATED,
    INTEGRATION_DELETED,
} = require('../event-type');
const NotFoundError = require('../error/notfound-error');
const ValidationError = require('../error/validation-error');

const INTEGRATION_COLUMNS = [
    'id',
    'provider',
    'created_at',
    'description',
    'parameters',
];
const TABLE = 'integrations';

class IntegrationsStore {
    constructor(providers, eventStore, db, getLogger) {
        this.providers = providers;
        this.db = db;
        this.logger = getLogger('integrations-store.js');
        eventStore.on(INTEGRATION_CREATED, event =>
            this._createIntegration(event.data),
        );
        eventStore.on(INTEGRATION_UPDATED, event =>
            this._updateIntegration(event.data),
        );
        eventStore.on(INTEGRATION_DELETED, event =>
            this._deleteIntegration(event.data),
        );
    }

    getIntegrations() {
        return this.db
            .select(INTEGRATION_COLUMNS)
            .from(TABLE)
            .map(this.rowToIntegration);
    }

    getIntegration(id) {
        return this.db
            .first(INTEGRATION_COLUMNS)
            .from(TABLE)
            .where({ id })
            .then(this.rowToIntegration);
    }

    getProviders() {
        return this.providers;
    }

    rowToIntegration(row) {
        if (!row) {
            throw new NotFoundError('No integrations found');
        }
        return {
            id: row.id,
            provider: row.provider,
            description: row.description,
            parameters: row.parameters,
            createdAt: row.created_at,
        };
    }

    eventDataToRow(data) {
        return {
            id: data.id,
            provider: data.provider,
            description: data.description,
            parameters: JSON.stringify(data.parameters),
            created_at: data.createdAt, // eslint-disable-line
        };
    }

    _createIntegration(data) {
        this._validateProvider(data.provider);
        return this.db(TABLE)
            .insert(this.eventDataToRow(data), 'id')
            .then(result => {
                const [id] = result;
                // eslint-disable-next-line no-param-reassign
                data.id = id;
            })
            .catch(err =>
                this.logger.error('Could not insert integration, error: ', err),
            );
    }

    _updateIntegration(data) {
        this._validateProvider(data.provider);
        return this.db(TABLE)
            .where({ id: data.id })
            .update(this.eventDataToRow(data))
            .catch(err =>
                this.logger.error('Could not update integration, error: ', err),
            );
    }

    _deleteIntegration({ id }) {
        return this.db(TABLE)
            .where({ id })
            .del()
            .catch(err => {
                this.logger.error('Could not delete integration, error: ', err);
            });
    }

    _validateProvider(provider) {
        if (this.providers[provider] === undefined) {
            throw new ValidationError(
                `Unknown integration provider '${provider}'!`,
            );
        }
    }
}

module.exports = IntegrationsStore;
