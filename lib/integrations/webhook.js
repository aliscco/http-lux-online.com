/* eslint-disable prefer-template */

'use strict';

const axios = require('axios');
const handlebars = require('handlebars');
const merge = require('deepmerge');

module.exports = {
    name: 'webhook',
    displayName: 'Webhook',
    parameters: [
        {
            name: 'url',
            displayName: 'Webhook URL',
            type: 'string',
        },
        {
            name: 'headers',
            displayName: 'Header Template',
            type: 'text',
        },
        {
            name: 'body',
            displayName: 'Body Template',
            type: 'text',
        },
    ],
    // eslint-disable-next-line object-shorthand
    eventHandler: function(event, eventData) {
        const urlParameter = this.parameters.find(p => p.name === 'url');
        const headersParameter = this.parameters.find(
            p => p.name === 'headers',
        );
        const bodyParameter = this.parameters.find(p => p.name === 'body');

        let body;
        let headers = {};
        const context = {
            event,
            user: eventData.createdBy,
            feature: {
                name: eventData.data.name,
                description: eventData.data.description,
                enabled: eventData.data.enabled,
                strategies: eventData.data.strategies,
                variants: eventData.data.variants,
            },
        };

        if (headersParameter) {
            const parsedHeader = JSON.parse(headersParameter.value);
            headers = merge(headers, parsedHeader);
        }

        if (bodyParameter) {
            const template = handlebars.compile(bodyParameter.value);
            body = template(context);
        }

        const request = {
            method: 'post',
            url: urlParameter.value,
            headers,
            data: body,
        };

        this.logger.debug(request);

        axios
            .request(request)
            .then(res => {
                this.logger.debug(`${res.status} ${res.statusText}`);
            })
            .catch(error => {
                this.logger.error(error.toString());
            });
    },
};
