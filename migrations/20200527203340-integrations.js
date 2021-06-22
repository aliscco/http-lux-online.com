/* eslint camelcase: "off" */

'use strict';

exports.up = function(db, cb) {
    return db.createTable(
        'integrations',
        {
            id: {
                type: 'serial',
                primaryKey: true,
                notNull: true,
                autoIncrement: true,
            },
            provider: {
                type: 'string',
                notNull: true,
                length: 255,
            },
            description: {
                type: 'string',
                length: 255,
            },
            parameters: { type: 'json' },
            created_at: { type: 'timestamp', defaultValue: 'now()' },
        },
        cb,
    );
};

exports.down = function(db, cb) {
    return db.dropTable('integrations', cb);
};
