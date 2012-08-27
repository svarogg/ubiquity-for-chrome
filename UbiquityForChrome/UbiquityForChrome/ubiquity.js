// Simple binding for Ctrl+Key
// Based on: http://www.gmarwaha.com/blog/2009/06/16/ctrl-key-combination-simple-jquery-plugin/
$.ctrl = function (keyCode, callback, args) {
    var isCtrl = false;
    $(document).keydown(function (e) {
        if (!args) args = []; // IE barks when args is null

        if (e.keyCode == keyCode && e.ctrlKey) {
            callback.apply(this, args);
            return false;
        }
    }).keyup(function (e) {
        if (e.ctrlKey) isCtrl = false;
    });
};


// Creates the ubiquity popup
function createPopup() {
    $("body").append('<div id="ubiquity-popup" style="position: fixed; left: 1px; top: 1px; display:none; width: 810px; height: 561px; border: 0px; padding: 0px; z-index: 99999; background-image: url(http://people.opera.com/cosimo/ubiquity/ubiq_background.png); background-position: initial initial; background-repeat: initial initial; "><div id="ubiquity-input-panel" style="border:0; display:block; float:left; margin:0;;width:99%;height:55px"><form id="ubiq1" onsubmit="return false"><input autocomplete="off" id="ubiquity-input" style="border:0; padding:0; height:32px; margin-top:16px;margin-left:10px; background:none; color:black;font-family: Trebuchet MS, Arial, Helvetica; font-size: 28px;" type="text" size="60" maxlength="500"></form></div><br><div id="ubiquity-results-panel" style="width:100%;border:0; display:block; float:left; margin:0;clear:both; text-align: left; padding-top:2px; font-size: 19px; font-weight: normal; color:white; height: 502px;"><p style="font-size:17px; padding:8px; font-weight:normal">Type the name of a command and press enter to execute it, or <b>help</b> for assistance.</p></div><div id="ubiquity-command-tip" style="position:absolute;left:310px;top:65px;display:block;border:0;color:#ddd;font-family:Helvetica,Arial;font-style:italic;font-size:11pt"></div><div id="ubiquity-command-preview" style="position:absolute;left:310px;top:85px;display:block;overflow:auto;border:0;color:#ddd;"></div></div>')
    $("#ubiquity-popup").keydown(function (e) {
        switch (e.keyCode) {
            case ESC:
                hidePopup();
        }
    });
}

// Shows the ubiquity popup
function showPopup() {
    window.selectedText = getSelectedText();
    $("#ubiquity-popup").show();
    $("#ubiquity-input").focus();
}

// Shows the ubiquity popup
function hidePopup() {
    $("#ubiquity-popup").hide();
}

// returns the text currently selected by user.
function getSelectedText() {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    if (range) {
        var div = document.createElement('div');
        div.appendChild(range.cloneContents());
        return div.innerText;
    }
    else {
        return null;
    }
}

// Initialization scripts
createPopup();
$.ctrl(SPACE, showPopup);
