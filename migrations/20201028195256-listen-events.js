'use strict';

const async = require('async');

exports.up = function(db, cb) {
    async.series(
        [
            db.runSql.bind(
                db,
                `
                CREATE OR REPLACE FUNCTION notify_event()
                RETURNS trigger 
                LANGUAGE plpgsql
                AS $BODY$
                BEGIN
                    PERFORM pg_notify('event', row_to_json(NEW)::text);
                    RETURN NULL;
                END; 
                $BODY$`,
            ),
            db.runSql.bind(
                db,
                `
                CREATE TRIGGER notify_event
                AFTER INSERT
                ON "events"
                FOR EACH ROW
                EXECUTE PROCEDURE notify_event();`,
            ),
        ],
        cb,
    );
};

exports.down = function(db, cb) {
    async.series(
        [
            db.runSql.bind(db, `DROP TRIGGER notify_event ON events`),
            db.runSql.bind(db, `DROP FUNCTION notify_event()`),
        ],
        cb,
    );
};
