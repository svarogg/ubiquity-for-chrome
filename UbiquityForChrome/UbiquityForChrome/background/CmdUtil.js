var CmdUtil = {
    CreateCommand: function (options) {
        var command = new Command();
        $.each(options, function (key, value) {
            command[key] = value;
        });
        return command;
    }
}

var command = CmdUtil.CreateCommand({
  names: ["link to Wikipedia"],
  arguments: {
    object: noun_arb_text,
    format: noun_type_lang_wikipedia,
  },
  description:
  "Turns a phrase into a link to the matching Wikipedia article.",
  icon: "chrome://ubiquity/skin/icons/wikipedia.ico",
  _link: function(){
    var url = ("http://" + (data || "en") +
               ".wikipedia.org/wiki/Special%3ASearch/" +
               encodeURIComponent(text.replace(/ /g, "_")));
    return ['<a href="' + Utils.escapeHtml(url) + '">' + html + "</a>", url];
  },
  execute: function (args) {
    var html = this._link(args);
    CmdUtils.setSelection(htm, {text: url});
  },
  preview: function (pbl, args) {
    var [htm, url] = this._link(args);
    pbl.innerHTML = (
      this.previewDefault() +
      (htm && ("<p>" + htm + "</p>" + <code>{url}</code>.toXMLString())));
  }
});

console.log(command);