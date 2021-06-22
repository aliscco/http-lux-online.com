'use strict';

const SSE = require('express-sse');

const sse = new SSE();

const Controller = require('../controller');

class StreamController extends Controller {
    constructor({ eventStore }) {
        super();
        this.eventStore = eventStore;

        this.get('/', sse.init);

        this.eventStore.on('stream', evt => {
            sse.send(evt.data, evt.type, evt.id);
        });
    }
}

module.exports = StreamController;
