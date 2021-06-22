/* eslint camelcase:off */

'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');

const COLUMNS = [
    'app_name',
    'created_at',
    'updated_at',
    'description',
    'strategies',
    'url',
    'color',
    'icon',
];
const TABLE = 'client_applications';

const mapRow = row => ({
    appName: row.app_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    strategies: row.strategies,
    url: row.url,
    color: row.color,
    icon: row.icon,
});

const remapRow = (input, old = {}) => ({
    app_name: input.appName,
    updated_at: input.updatedAt,
    description: input.description || old.description,
    url: input.url || old.url,
    color: input.color || old.color,
    icon: input.icon || old.icon,
    strategies: JSON.stringify(input.strategies || old.strategies),
});

class ClientApplicationsDb {
    constructor(db, eventBus) {
        this.db = db;
        this.eventBus = eventBus;
    }

    _createTimer(action) {
        return metricsHelper.wrapTimer(this.eventBus, DB_TIME, {
            store: 'applications',
            action,
        });
    }

    async updateRow(details, prev) {
        const timer = this._createTimer('updateRow');

        const data = { ...details, updatedAt: 'now()' };

        await this.db(TABLE)
            .where('app_name', data.appName)
            .update(remapRow(data, prev));

        timer();
    }

    async insertNewRow(details) {
        return this.db(TABLE).insert(remapRow(details));
    }

    async upsert(data) {
        const timer = this._createTimer('upsert');
        if (!data) {
            throw new Error('Missing data to add / update');
        }

        const result = await this.db(TABLE)
            .select(COLUMNS)
            .where('app_name', data.appName);

        if (result && result[0]) {
            this.updateRow(data, result[0]);
        } else {
            this.insertNewRow(data);
        }

        timer();
    }

    async getAll() {
        const timer = this._createTimer('getAll');

        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('app_name', 'asc');

        const applications = rows.map(mapRow);
        timer();
        return applications;
    }

    async getApplication(appName) {
        const item = await this.db
            .first(COLUMNS)
            .where('app_name', appName)
            .from(TABLE);

        return mapRow(item);
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
    async getAppsForStrategy(strategyName) {
        const rows = await this.db.select(COLUMNS).from(TABLE);
        return rows
            .map(mapRow)
            .filter(app => app.strategies.includes(strategyName));
    }

    async getApplications(filter) {
        return filter && filter.strategyName
            ? this.getAppsForStrategy(filter.strategyName)
            : this.getAll();
    }
}

module.exports = ClientApplicationsDb;
