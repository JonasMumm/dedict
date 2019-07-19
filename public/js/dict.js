let scrollPosPrev = 0;
let isLoading = false;
$(document).ready(() => {

    getWords(getRandomInt(0, 176023), "center", () => {
        scrollToWord();
    });


    $("#scrollContainerDictionary").on("scroll", function () {
        let scroll = $("#scrollContainerDictionary").scrollTop();
        //console.log("scrolling");
        //if scrolled down
        if (scroll - scrollPosPrev > 0) {

            //console.log("scrolling: "+ scroll +" "+$("#scrollContainerDictionary")[0].scrollHeight +" "+ -$("#scrollContainerDictionary").innerHeight());

            if (scroll > $("#scrollContainerDictionary")[0].scrollHeight - $("#scrollContainerDictionary").innerHeight() * 3) {
                const lastId = $("#wordContainer").find(".deffinition").last().data().wordId;
                getWords(lastId + 1, "down");
            }
        }
        else {
            //scroll up is broken
            if (scroll < $("#scrollContainerDictionary").innerHeight() * 2) {
                const firstId = $("#wordContainer").find(".deffinition").first().data().wordId;
                getWords(firstId - 1, "up");
            }

        }

        scrollPosPrev = scroll;

    });


    $("#btnSearch").on("click", () => {
        jumpToWordMain($("#txtSearch").val());
    });

    $("#txtSearch").keydown((event) => {
        if (event.which == 13) //if enter
        {
            jumpToWordMain($("#txtSearch").val());
        }
    });

    $("#aboutButton").on("click", () => {
        aboutShow();
    });

    $(".aboutContainer").on("click", (event) => {
        if(event.target.id=="aboutMarginContainer" || event.target.id=="aboutClose" ){
        aboutHide();
        }
    });


});
function getWords(startingIndex, direction /* "up", "down" or "center"*/, next, clear) {
    if (!isLoading) {
        isLoading = true;
        $.get(`/dedict/scrollload/${startingIndex}/${direction}`, function (data) {


            setTimeout(()=>{isLoading = false;},300);

            if (clear) {
                $("#wordContainer").empty();
            }

            data = JSON.parse(data);

            if (direction != "up") {
                for (let n = 0; n < data.length; n++) {
                    wordAdd(data[n], direction);
                }
            }
            else {

                //we gotta adjust scroll position afterwards
                const heightBefore = $("#scrollContainerDictionary")[0].scrollHeight;

                wordAdd(data[0], "up");
                for (let n = 1; n < data.length; n++) {
                    wordAdd(data[n], "down");
                }
                /*for (let n = data.length-1; n >=0; n--) {
                    wordAdd(data[n], "up");
                }*/

                //Don't need this any longer?
                //resetScrollPositionAfterWordLoadWhenUpdated(heightBefore);

            }

            //console.log(data);

            

            if (next)
                next();

        });




    }
    else {
        console.log("Wanna load, but can*t");
    }
}


function wordAdd(word, direction) {

    //set desired div
    const children = $("#wordContainer").children();

    if (children.length == 0) {
        //wow, we are the FIRST child, what an honour!
        //$(wordContainer).append(`<div>${word.word}</div`); 
        wordAddFirst(word);
    }
    else {
        if (direction != "up")
            wordAddAfter(word);
        else
            wordAddBefore(word);
    }

    //$(".dictTreeElem:has(>p)").css({"color":"rgb(255,255,0)"})

}

function wordAddFirst(word) {
    let substr;
    let currentRefElem = "#wordContainer";
    let elemId;
    let changersAdded = 0;
    let dictWordClass;

    for (let l = 0; l < word.word.length; l++) {
        substr = word.word.substring(0, l + 1);
        elemId = `_${escapeHTMLIdAttribute(substr)}`;
        $(currentRefElem).append(`<div id="${elemId}" class="dictTreeElem"></div`);
        currentRefElem = `#${elemId}`;

        if (l == word.word.length - 1 || true) {


            if (changersAdded == 0) {
                dictWordClass = "dictWordChanger";
                changersAdded += 1;
            }
            else {
                dictWordClass = "dictWordAdder";
            }

            $(currentRefElem).append(`<h1 class="dictWord ${dictWordClass}"><span class="invisible">${substr.substring(0, l)}</span>${substr.substring(l, l + 1)}</h1>`);
        }
    }

    if ($(currentRefElem).children(`.scrollSnapOffset`).length == 0)
        scrollSnapObject = `<div class="scrollSnapOffset"></div>`;
    else
        scrollSnapObject = ``;

    $(currentRefElem).append(`${scrollSnapObject}<p class="deffinition" data-word-id="${word.rowid}">${word.definition}</p>`);
    $(currentRefElem).children(".deffinition").lettering('words');
    $(currentRefElem).children(".deffinition").children().addClass("dictLink");
    $(currentRefElem).children(".deffinition").children().on("click", jumpToWord);
}

function wordAddAfter(word) {
    let substr;
    let currentRefElem = $("#wordContainer");
    let elemId;
    let newRefElem;
    let changersAdded = 0;
    let dictWordClass;
    let scrollSnapObject;
    let dictTreeElemChildren;

    //how far down the domtree can I travers until I dont find an existing element?
    for (let l = 0; l < word.word.length; l++) {
        substr = word.word.substring(0, l + 1);

        //desired element id:
        elemId = `_${escapeHTMLIdAttribute(substr)}`;

        newRefElem = $(`#${elemId}`);


        if (newRefElem.length > 0) {
            currentRefElem = newRefElem;
        }
        else {
            //shiiet no fitting dict tree elem exists!
            //decide whether to append or to insert somewhere in between other dictTreeElemDivs.
            dictTreeElemChildren = $(currentRefElem).children(`.dictTreeElem`);

            if (dictTreeElemChildren.length == 0)
                $(currentRefElem).append(`<div id="${elemId}" class="dictTreeElem" data-line="219"></div`);
            else {
                let addAfter = undefined;
                let added = false;

                for (let n = 0; n < dictTreeElemChildren.length; n++) {
                    //console.log("ID IS "+dictTreeElemChildren[n].id)
                    if (dictTreeElemChildren[n].id < elemId) {
                        addAfter = dictTreeElemChildren[n].id;
                    }
                    else {
                        //time to add after addAfter if exist

                        if (addAfter === undefined) {
                            addAfter = null;
                            console.log("ID ID : " + currentRefElem.get(0).id);
                            $(`<div id="${elemId}" class="dictTreeElem" data-line="240"></div`).insertAfter(`#${currentRefElem.get(0).id}>h1`);
                            //$(currentRefElem).prepend(`<div id="${elemId}" class="dictTreeElem"></div`);
                            added = true;
                        }
                        else {
                            console.log("Time to add after: " + addAfter);
                            $(`<div id="${elemId}" class="dictTreeElem" data-line="247"></div`).insertAfter(`#${addAfter}`)
                            added = true;
                        }

                        break;
                    }
                }

                if (!added)
                    $(currentRefElem).append(`<div id="${elemId}" class="dictTreeElem"  data-line="256"></div`);


            }


            currentRefElem = `#${elemId}`;

            if (l == word.word.length - 1 || true) {


                if (changersAdded == 0) {
                    dictWordClass = "dictWordChanger";
                    changersAdded += 1;
                }
                else {
                    dictWordClass = "dictWordAdder";
                }
                $(currentRefElem).append(`<h1 class="dictWord ${dictWordClass}"><span class="invisible">${substr.substring(0, l)}</span>${substr.substring(l, l + 1)}</h1>`);
            }
        }

        //console.log(`l is ${l} and length is `)

    }

    if ($(currentRefElem).children(`.scrollSnapOffset`).length == 0)
        scrollSnapObject = `<div class="scrollSnapOffset"></div>`;
    else
        scrollSnapObject = ``;

    $(currentRefElem).append(`${scrollSnapObject}<p class="deffinition" data-word-id="${word.rowid}">${word.definition}</p>`);
    $(currentRefElem).children(".deffinition").lettering('words');
    $(currentRefElem).children(".deffinition").children().addClass("dictLink");
    $(currentRefElem).children(".deffinition").children().on("click", jumpToWord);
}

function wordAddBefore(word) {
    let substr;
    let currentRefElem = $("#wordContainer");
    let elemId;
    let newRefElem;
    let changersAdded = 0;
    let dictWordClass;
    let scrollSnapObject;

    //how far down the domtree can I travers until I dont find an existing element?
    for (let l = 0; l < word.word.length; l++) {
        substr = word.word.substring(0, l + 1);

        //desired element id:
        elemId = `_${escapeHTMLIdAttribute(substr)}`;

        newRefElem = $(`#${elemId}`);

        if (newRefElem.length > 0) {
            currentRefElem = newRefElem;
        }
        else {
            //$(currentRefElem).prepend(`<div id="${elemId}" class="dictTreeElem"></div>`);
            $(`<div id="${elemId}" class="dictTreeElem"></div>`).insertAfter(`#${$(currentRefElem).attr('id')} > h1`);
            currentRefElem = `#${elemId}`; //the dicttreeelement div

            if (l == word.word.length - 1 || true) {


                if (changersAdded == 0) {
                    dictWordClass = "dictWordChanger";
                    changersAdded += 1;
                }
                else {
                    dictWordClass = "dictWordAdder";
                }


                $(currentRefElem).append(`<h1 class="dictWord ${dictWordClass}"><span class="invisible">${substr.substring(0, l)}</span>${substr.substring(l, l + 1)}</h1>`);
            }
        }

        //console.log(`l is ${l} and length is `)

    }

    if ($(currentRefElem).children(`.scrollSnapOffset`).length == 0)
        scrollSnapObject = `<div class="scrollSnapOffset"></div>`;
    else
        scrollSnapObject = ``;


    $(`${scrollSnapObject}<p class="deffinition" data-word-id="${word.rowid}">${word.definition}</p>`).insertAfter(`${$(currentRefElem).attr('id')} > h1`);
    //($(currentRefElem).append(`${scrollSnapObject}<p class="deffinition" data-word-id="${word.rowid}">${word.definition}</p>`);
    $(currentRefElem).children(".deffinition").lettering('words');
    $(currentRefElem).children(".deffinition").children().addClass("dictLink");
    $(currentRefElem).children(".deffinition").children().on("click", () => { jumpToWord($(this).text()) });

}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function scrollToWord(word) {
    let offsetElement;
    if (!word) {

        let elems = $("#wordContainer").find(".scrollSnapOffset");
        offsetElement = elems.get(Math.round(elems.length * 0.5));

    }
    else {
        offsetElement = $(`#_${escapeHTMLIdAttribute(word)}`).first().get(0);
    }
    if (offsetElement != null) {
        $("#scrollContainerDictionary").scrollTop($(offsetElement).position().top - 200 + $("#scrollContainerDictionary").scrollTop());
    }

}

function jumpToWord() {
    //first, try to see whether the looked for word actually already exists...


    text = escapeHTMLIdAttribute($(this).text());

    jumpToWordMain(text);

}

function jumpToWordMain(text) {
    let found = false;
    for (let n = text.length; n >= Math.max(2, text.length - 3); n--) {
        let substr = text.substring(0, n);


        let elem = $(`#_${substr}`);

        if (elem) {
            if (elem.length > 0) {

                scrollToWord(substr);
                found = true;
                n = -1;
            }
        }
    }

    if (!found) {
        //get id from server
        console.log("Couldnt find requested word in DOM, let's look it up at the server, shall we?");

        $.get(`/dedict/word_id/${text}`, function (data) {

            let word_id = JSON.parse(data).word_id;

            console.log("ID of " + text + " is " + word_id);


            getWords(word_id, "center", () => { scrollToWord(text) }, true);

        });
    }


}

function escapeHTMLIdAttribute(string) {
    const s = string.replace("'", "_..__.");
    return s.replace(/[^0-9a-z _-]/gi, '').toLowerCase();
}

///

/**
 * Actually updating container size takes time, so we retry it every 10 miliseconds until it's updated.
 */
function resetScrollPositionAfterWordLoadWhenUpdated(originalContainerSize) {

    callMeWithTimeOut(originalContainerSize);

    function callMeWithTimeOut(size) {
        const heightAfter = $("#scrollContainerDictionary")[0].scrollHeight;
        console.log(`Difference is ${heightAfter - originalContainerSize}`)
        if (heightAfter - size !== 0) {
            console.log(`Difference is SUCCESS`)
            console.log(`Scroll top is ${$("#scrollContainerDictionary").scrollTop()}`);
            //$("#scrollContainerDictionary").scrollTop($("#scrollContainerDictionary").scrollTop() + heightAfter - size);
            console.log(`Scroll top is ${$("#scrollContainerDictionary").scrollTop()}`);
        }
        else {
            setTimeout(function () { callMeWithTimeOut(size) }, 10);;
        }
    }

}

function aboutShow() {
    $(`.aboutContainer`).css({
        "opacity": "1",
        "visibility": "visible",
        "pointer-events": "all",
        
    });

    $(`.aboutContainerContent`).css({
        "transform":"translate(0,0)"
        
    });
}

function aboutHide() {
    $(`.aboutContainer`).css({
        "opacity": "0",
        "pointer-events": "none",
        
    });

    $(`.aboutContainerContent`).css({
        "transform":"translate(-100vh,0)"
        
    });
}