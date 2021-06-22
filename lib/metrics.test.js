'use strict';

const { test } = require('ava');
const { EventEmitter } = require('events');
const eventBus = new EventEmitter();
const { REQUEST_TIME } = require('./events');
const { startMonitoring } = require('./metrics');
const { register: prometheusRegister } = require('prom-client');

test('should collect metrics for requests', t => {
    startMonitoring(true, eventBus);
    eventBus.emit(REQUEST_TIME, {
        path: 'somePath',
        method: 'GET',
        statusCode: 200,
        time: 1337,
    });

    const metrics = prometheusRegister.metrics();
    t.regex(
        metrics,
        /http_request_duration_milliseconds{quantile="0\.99",path="somePath",method="GET",status="200"} 1337/
    );
});
