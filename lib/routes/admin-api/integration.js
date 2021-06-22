'use strict';

const Controller = require('../controller');

const eventType = require('../../event-type');
const extractUser = require('../../extract-user');
const schema = require('./integration-schema');
const { handleErrors } = require('./util');
const {
    CREATE_INTEGRATION,
    UPDATE_INTEGRATION,
    DELETE_INTEGRATION,
} = require('../../permissions');

class IntegrationController extends Controller {
    constructor(config) {
        super(config);
        this.logger = config.getLogger('/admin-api/integrations.js');
        this.integrationsStore = config.stores.integrationsStore;
        this.eventStore = config.stores.eventStore;

        this.get('/', this.getIntegrations);
        this.get('/providers', this.getIntegrationProviders);
        this.post('/', this.createIntegration, CREATE_INTEGRATION);
        this.put('/:id', this.updateIntegration, UPDATE_INTEGRATION);
        this.delete('/:id', this.deleteIntegration, DELETE_INTEGRATION);
    }

    async getIntegrations(req, res) {
        try {
            const integrations = await this.integrationsStore.getIntegrations();
            res.json({ integrations });
        } catch (err) {
            this.logger.error(err);
            res.status(500).end();
        }
    }

    async getIntegrationProviders(req, res) {
        try {
            const integrationProviders = await this.integrationsStore.getProviders();
            res.json({ providers: integrationProviders });
        } catch (err) {
            this.logger.error(err);
            res.status(500).end();
        }
    }

    async createIntegration(req, res) {
        try {
            const value = await schema.validateAsync(req.body);
            await this.eventStore.store({
                type: eventType.INTEGRATION_CREATED,
                createdBy: extractUser(req),
                data: value,
            });
            res.status(201).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async updateIntegration(req, res) {
        try {
            const value = await schema.validateAsync(req.body);
            await this.integrationsStore.getIntegration(req.params.id);
            value.id = parseInt(req.params.id, 10);
            await this.eventStore.store({
                type: eventType.INTEGRATION_UPDATED,
                createdBy: extractUser(req),
                data: value,
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }

    async deleteIntegration(req, res) {
        try {
            await this.integrationsStore.getIntegration(req.params.id);
            await this.eventStore.store({
                type: eventType.INTEGRATION_DELETED,
                createdBy: extractUser(req),
                data: {
                    id: parseInt(req.params.id, 10),
                },
            });
            res.status(200).end();
        } catch (error) {
            handleErrors(res, this.logger, error);
        }
    }
}

module.exports = IntegrationController;
