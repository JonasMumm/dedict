const sqlite3 = require('sqlite3').verbose();

let db;
let entryAmount;

module.exports = {

    connectionInit: function (next) {
        db = new sqlite3.Database("./db/Dictionary.db", sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                throw err;
            }
            console.log("DB opened");

            dbInit(next);
        })
    }
    ,

    execute: function (sql, binding, next) {
        const statement = db.prepare(sql);
        if (binding) {
            statement.bind(binding);
        }
        statement.all((err, rows) => {

            if (err) {
                console.log(`Error! in get for sql: ${{ sql }}`);
                console.log(err);
            }
            if (next) {
                next(rows);

            }
        }
        );

    },

    run: function (sql, binding, next) {
        const statement = db.prepare(sql);
        if (binding) {
            statement.bind(binding);
        }
        statement.run(function (err, rows) {

            if (err) {
                console.log(`Error! in get for sql: ${{ sql }}`);
                console.log(err);
            }
            if (next) {
                next(rows, this.lastID);
            }
        }
        );

    },

    getEntryAmount: function () {
        return entryAmount;
    }


}

function dbInit(next) {



    module.exports.execute("SELECT count(word) as count FROM entries", undefined, (rows) => {

        entryAmount = rows[0].count;
        console.log("Found " + entryAmount + " words in dictionary");

    });
    module.exports.execute(`DROP TABLE IF EXISTS entries_ordered`, undefined, (rows) => {
        module.exports.execute(`CREATE TABLE entries_ordered (word TEXT, wordtype TEXT, definition TEXT);`, undefined, (rows) => {
            module.exports.execute(`INSERT INTO entries_ordered (word,wordtype, definition) SELECT word , wordtype , definition FROM entries ORDER BY word ;`, undefined, (rows) => {
                module.exports.execute(`DROP TABLE entries;`, undefined, (rows) => {
                    module.exports.execute(`ALTER TABLE entries_ordered RENAME TO entries;`, undefined, (rows) => {
                        next();
                    });
                });
            });
        });
    });



}







