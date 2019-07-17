const model = require("./model.js");

module.exports = {

    scrollLoad: function (req, res) {
        const requested_id = parseInt(req.params.requested_id);
        const requested_direction = req.params.requested_direction;  //up, down , center
        const returnElements = 50; //needs to be an even number!
        let minIndex;
        let maxIndex;
        switch (requested_direction) {
            case "down":
            default:
                minIndex = Math.max(Math.round(requested_id), 0);
                maxIndex = Math.min(Math.round(requested_id + returnElements - 1), model.getEntryAmount() - 1);
                break;

            case "up":
                minIndex = Math.max(Math.round(requested_id - returnElements + 1), 0);
                maxIndex = Math.min(Math.round(requested_id), model.getEntryAmount() - 1);
                break;

            case "center":
                minIndex = Math.max(Math.round(requested_id - returnElements * 0.5 + 1), 0);
                maxIndex = Math.min(Math.round(requested_id + returnElements * 0.5), model.getEntryAmount() - 1);
                break;
        }

        console.log("Received request, min index is " + minIndex + " ,max index is " + maxIndex);

        model.execute(`SELECT rowid,* FROM entries ORDER BY word ASC LIMIT $entries OFFSET $startEntry;`, { $entries: maxIndex - minIndex + 1, $startEntry: minIndex - 1 }, (rows) => {

            const strJSON = JSON.stringify(rows);


            res.write(strJSON);
            res.end();
        });

    },

    word_id: function (req, res) {
        const word = (req.params.word);
        let i = 0;
        console.log("Received request for word " + word);

        lookforWord = function (t, next, success, fail) {
            model.execute(`SELECT rowid FROM entries WHERE word LIKE $word ORDER BY LENGTH(word) ASC LIMIT 5`, { $word: `${t}%` }, (rows) => {
                if (rows.length > 0) {
                    //sucess!
                    success(rows[0].rowid);
                }
                else {
                    if (t.length > 1) {
                        //try again with shorter string. Recursion baby!
                        next(t.substring(0, t.length - 1), next, success, fail)
                    }
                    else {
                        //couldnt find it...
                        fail();
                    }
                }

            });
        }

        lookforWord(word, lookforWord, (id) => {
            const strJSON = JSON.stringify({ word_id: id, success: true });
            res.write(strJSON);
            res.end();
        }, () => {
            const strJSON = JSON.stringify({ word_id: -1, success: false });
            res.write(strJSON);
            res.end();
        }
        )




    }


}