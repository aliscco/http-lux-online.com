'use strict';

// const { DROP_FEATURES } = require('../event-type');
const { EventEmitter } = require('events');

const events = [];

class EventStore extends EventEmitter {
    constructor() {
        super();
    }

    store(event) {
        const copy = Object.assign({}, event, { createdAt: new Date() });
        events.push(copy);
        this.emit(event.type, event);
        return Promise.resolve();
    }

    getEvents() {
        return Promise.resolve(events.reverse());
    }

    getEventsFilterByName(name) {
        // TODO: also higher than last "DROP_FEATURES"!
        const eventsByName = events.filter(e => e.data.name === name);

        return Promise.resolve(eventsByName.reverse());
    }

    rowToEvent(row) {
        return {
            id: row.id,
            type: row.type,
            createdBy: row.created_by,
            createdAt: row.created_at,
            data: row.data,
        };
    }
}

module.exports = EventStore;
