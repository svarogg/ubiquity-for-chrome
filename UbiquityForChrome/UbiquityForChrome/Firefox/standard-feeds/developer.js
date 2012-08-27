// -----------------------------------------------------------------
// DEVELOPER COMMANDS
// -----------------------------------------------------------------

var {slice} = Array, gXS = XMLSerializer();
function qsaa(lm, sl) slice(lm.querySelectorAll(sl));
function qstc(lm, sl) (lm = lm.querySelector(sl)) ? lm.textContent : "";
function qsxs(lm, sl) (
  (lm = lm.querySelector(sl)) ? gXS.serializeToString(lm) : "");

CmdUtils.CreateCommand({
  names: ["highlight syntax", "hilite syntax", "prettify code"],
  description: ("Treats your selection as program source code, " +
                "guesses its language, and colors it based on syntax."),
  homepage: "http://code.google.com/p/google-code-prettify/",
  author: "satyr",
  license: "MIT",
  icon: "chrome://ubiquity/skin/icons/color_wheel.png",
  execute: function prettify_execute() {
    var codes = this._codes();
    if (!codes.length) return displayMessage(
      _("You must select some code to syntax-hilight."));

    for each (let code in codes) code.className += " prettyprint";
    var doc = codes[0].ownerDocument;
    if (doc.getElementById(this._id))
      this._onload(doc.defaultView, doc);
    else {
      CmdUtils.injectCss("resource://ubiquity/scripts/prettify.css", doc)
        .id = this._id;
      CmdUtils.injectJavascript(
        "resource://ubiquity/scripts/prettify.js", this._onload, doc);
    }
  },
  preview: function prettify_preview(pb) {
    this.previewDefault(pb);
    for each (let code in this._codes()) {
      pb.appendChild(pb.ownerDocument.createElement("hr"));
      pb.appendChild(Utils.ellipsify(code, 80));
    }
  },
  _codes: function prettify_codes() {
    var $nodes = $(CmdUtils.getSelectedNodes(1)), slctr = this._selector;
    var codes = $nodes.filter(slctr).get();
    if (!codes.length) codes = $.unique($nodes.closest(slctr).get());
    if (!codes.length) codes = qsaa(CmdUtils.document, slctr);
    return codes;
  },
  _onload: function prettify_onload(win, doc) {
    win.wrappedJSObject.PR_TAB_WIDTH = 2;
    switch (doc.contentType) {
      case "text/html": case "application/xhtml+xml":
      win.location = "javascript:prettyPrint()";
      return;
    }
    for each (let pp in qsaa(doc, ".prettyprint")) {
      // workaround for the view-source view's weird innerHTML behavior
      let pre = Utils.hiddenWindow.document.createElementNS(
        "http://www.w3.org/1999/xhtml", "pre");
      for each (let a in Array.slice(pp.attributes))
        pre.setAttribute(a.name, a.value);
      pre.innerHTML = win.wrappedJSObject.prettyPrintOne(pp.innerHTML);
      pp.parentNode.removeChild(pp);
      doc.body.appendChild(pre);
    }
  },
  _id: Math.random().toString(36).slice(2),
  _selector: [e + ":not(.prettyprint)"
              for each (e in ["pre", "code", "xmp"])].join(","),
});

CmdUtils.CreateCommand({
  names: ["view source", "view page source"],
  description: "Shows you the source-code of the specified URL.",
  author: {name: "Aza", email: "azaaza@gmail.com"},
  icon: "chrome://ubiquity/skin/icons/page_code.png",
  argument: noun_type_url,
  execute: function vs_execute(args) {
    Utils.openUrlInBrowser("view-source:" + args.object.text);
  },
  preview: function vs_preview(pb, {object: {html, data}}) {
    pb.innerHTML = (
      this.previewDefault() +
      (!data || !data.title ? "" :
       "<p>" + Utils.escapeHtml(data.title) + "</p>") +
      (html && "<pre>" + html.link(html) + "</pre>"));
  }
});

CmdUtils.CreateCommand({
  name: "view selection source",
  description: "Shows you the source-code of the selected HTML.",
  author: "satyr",
  license: "MIT",
  icon: "chrome://ubiquity/skin/icons/page_code.png",
  execute: function vss_execute() {
    context.chromeWindow.nsContextMenu.prototype
      .viewPartialSource.call(0, "selection");
  },
  preview: function vss_preview(pb) {
    var sel = context.focusedWindow.getSelection();
    if (sel.isCollapsed) return void this.previewDefault(pb);

    XML.prettyIndent = 1;
    XML.prettyPrinting = XML.ignoreWhitespace = true;
    XML.ignoreComments = false;
    var pretties = [];
    var re_ns = / xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"(?=\/?>)/g;
    for (let i = 0, c = sel.rangeCount; i < c; ++i) {
      let xml = gXS.serializeToString(sel.getRangeAt(i).cloneContents());
      if (xml) pretties.push(
        XML("<_>" + xml + "</_>").*.toXMLString().replace(re_ns, ""));
    }
    pb.innerHTML = (
      '<link rel="stylesheet"' +
      ' href="resource://ubiquity/scripts/prettify.css">'+
      '<pre id="selection-source" class="prettyprint lang-htm">' +
      pretties.map(Utils.escapeHtml).join("<hr/>"));
    var script = pb.appendChild(pb.ownerDocument.createElement("script"));
    script.setAttribute("onload", "prettyPrint()");
    script.src = "resource://ubiquity/scripts/prettify.js";
  },
});

const REP_WITH = _("Replaces your input with:");
const COPIED = _("Copied: %s");

function copyAndShow(text, self) {
  Utils.clipboard.text = text;
  displayMessage(COPIED.replace("%s", Utils.ellipsify(text, 80)), self);
}

CmdUtils.CreateCommand({
  names: ["escape HTML entities"],
  description: Utils.escapeHtml(
    "Replaces HTML entities (<, >, &, \" and ')" +
    " with their entity references."),
  authors: ["Aza?", "satyr"],
  icon: "chrome://ubiquity/skin/icons/html_go.png",
  arguments: {object: noun_arb_text},
  preview: function ehe_preview(pb, {object: {html}}) {
    if (!html) return void this.previewDefault(pb);
    pb.innerHTML = REP_WITH + <pre>{html}</pre>.toXMLString();
  },
  execute: function ehe_execute({object: {html}}) {
    if (!html) return;
    if (CmdUtils.isSelected)
      CmdUtils.setSelection(Utils.escapeHtml(html), {text: html});
    else copyAndShow(html, this);
  },
});

CmdUtils.CreateCommand({
  names: ["unescape HTML entities"],
  description: Utils.escapeHtml(
    "Replaces HTML character references (e.g. &spades; &#x2665; &#9827; ...)" +
    " with their corresponding Unicode characters."),
  author: "satyr",
  license: "MIT",
  icon: "chrome://ubiquity/skin/icons/html_go.png",
  arguments: {object: noun_arb_text},
  preview: function uhe_preview(pb, {object: {html}}) {
    if (!html) return void this.previewDefault(pb);
    pb.innerHTML = REP_WITH + "<br/><br/>" + Utils.unescapeHtml(html);
  },
  execute: function uhe_execute({object: {html}}) {
    if (!html) return;
    var uhtml = Utils.unescapeHtml(html);
    var uuhtml = Utils.unescapeHtml(uhtml);
    if (CmdUtils.isSelected)
      CmdUtils.setSelection(uhtml, {text: uuhtml});
    else copyAndShow(uuhtml, this);
  },
});

const JQAPI = "http://api.jquery.com/";
var jQACmd = CmdUtils.CreateCommand({
  name: "jQuery API",
  description: "Browses " + "jQuery API".link(JQAPI) + ".",
  author: "satyr",
  license: "MIT",
  icon: "chrome://ubiquity/skin/icons/jquery.ico",
  argument: {
    name: JQAPI,
    label: "category/method/selector",
    default: function jqa_default(cb) {
      var me = this;
      function jqa_scs(xml) {
        var {makeSugg} = CmdUtils, list = me._list, cdic = {__proto__: null};
        for each (let c in qsaa(xml, "categories, categories category")) {
          if (c.hasChildNodes()) c.categories = slice(c.children);
          let name = c.getAttribute("name");
          if (name) {
            cdic[name] = c;
            let path = name.toLowerCase().replace(/ /g, "-");
            c.url = JQAPI + "category/" + path + "/";
            c.entries = [];
          }
          else name = "All", c.url = JQAPI;
          list.push(makeSugg(c.text = name, null, c));
        }
        for each (let e in qsaa(xml, "entries > entry")) {
          for each (let ec in qsaa(e, "category")) {
            let name = ec.getAttribute("name");
            if (name in cdic) cdic[name].entries.push(e);
          }
          let name = e.name = e.getAttribute("name");
          let type = e.type = e.getAttribute("type");
          let path = name, text;
          if (type === "selector") {
            path = name.replace(/[A-Z]/g, "-$&").toLowerCase() + "-selector";
            text = qstc(e, "sample");
          }
          else let (arg = e.querySelector("signature > argument"))
            text = name + "(" + (arg ? arg.getAttribute("name") : "") + ")";
          e.url = JQAPI + path + "/";
          e.desc = qsxs(e, "signature + desc");
          e.longdesc = qsxs(e, "longdesc");
          list.push(makeSugg(e.text = text, null, e));
        }
        delete jQACmd.icon;
        [me.default] = list;
        cb && cb();
      }
      function jqa_err(xhr, msg, err) {
        Utils.reportInfo(
          "Failed to get <" + this.url + "> (" + msg + ").\n" +
          xhr.status + " " + xhr.statusText);
        Utils.reportError(err);
        Utils.setTimeout(
          function jqa_r() me.default = me._default,
          1e3 * (1 << ++me._retries));
      }
      $.ajax({
        url: JQAPI + "api/", dataType: "xml",
        beforeSend: function(xhr) xhr.overrideMimeType("text/xml"),
        success: jqa_scs, error: jqa_err,
      });
      me._default = jqa_default;
      jQACmd.icon = "chrome://global/skin/icons/loading_16.png";
      return me.default = {text: "", summary: "..."};
    },
    suggest: function jqa_suggest(txt, htm, cb, sx) {
      var me = this, suggs = me._grep(txt);
      if (txt) {
        if (typeof this.default === "function")
          this.default(function jqa_async() { cb(me._grep(txt)) });
        suggs.push(CmdUtils.makeSugg(txt, null, null, .1, sx));
      }
      return suggs;
    },
    _grep: function jqa_grep(txt) CmdUtils.grepSuggs(txt, this._list),
    _list: [],
    _retries: 0,
  },
  execute: function jqa_execute({object: {text, data}}) {
    Utils.openUrlInBrowser(
      data ? data.url : JQAPI + encodeURIComponent(text));
  },
  preview: function jqa_preview(pb, {object: {data}}) {
    if (!data) return void this.previewDefault(pb);
    pb.ownerDocument.defaultView.scrollTo(0, 0);
    let nodes = data.categories || data.entries;
    if (nodes) {
      let htmls = [], div = function (s) s && "<div>" + s + "</div>";
      for each (let n in nodes) let (t = n.text.link(n.url).bold())
        htmls.push(
          "categories" in n
          ? t + div([c.text for each (c in n.categories)].join("&nbsp; ")) :
          "entries" in n
          ? t + div(["<code>" + e.text + "</code>"
                     for each (e in n.entries)].join("&nbsp; "))
          : "<code>" + t + "</code> " + div(n.desc));
      if (data.nodeName === "category") htmls.push("<b>..</b>");
      CmdUtils.previewList(pb, htmls, function jqa_browse(i) {
        jQACmd.preview(pb, {object: {data: nodes[i] || data.parentNode}});
      }, "div {text-indent:0em; padding-bottom:0.4ex; font-size:88%}");
      return;
    }
    var ttl, lst = "", sel = data.type === "selector";
    if (sel) ttl = data.name + " selector";
    else {
      ttl = data.text;
      let r = data.getAttribute("return");
      if (r) ttl +=
        " \u226B <em class='type'>" + r.replace(/\w+/g, this._type) + "</em>";
    }
    for each (let sig in qsaa(data, "signature")) {
      let args = [], dds = "";
      for each (let a in qsaa(sig, "argument")) {
        let n = a.getAttribute("name"), o = a.hasAttribute("optional");
        dds += (
          "<dd><var class='argument" + (o ? " optional'>" : "'>") + n +
          "</var> " + gXS.serializeToString(a.firstElementChild) + "</dd>");
        sel || args.push(o ? "[" + n + "]" : n);
      }
      let t = (sel
               ? "$('" + data.text + "')"
               : data.name + "(" + args.join(", ") + ")");
      lst += "<dt><code>" + t + "</code>" + this._added(sig) + "</dt>" + dds;
    }
    pb.innerHTML = (
      "<div id='jquery-api' class='" + data.type +"'>" + this._style +
      "<h1>" + ttl + "</h1><dl>" + lst + "</dl>" +
      (data.longdesc.length > 23 ? data.longdesc : data.desc) + "</div>");
    CmdUtils.absUrl($("a", pb), JQAPI);
  },
  _type: function jqa_type(t) t.link("http://docs.jquery.com/Types#" + t),
  _added: function jqa_added(lm) let(v = qstc(lm, "added")) (
    "<span class='added'>" +
    v.link(JQAPI + "category/version/" + v + "/") + "</span>"),
  _style: "<style>" + <![CDATA[
    h1 {margin:0.3ex 0 0; font-size:116%}
    dl {margin-top:0; padding:0 0.5em}
    dt {margin-top:0.3ex; border-bottom:solid 1px; font-size:108%}
    dd {margin-left:0em}
    dd, longdesc, div > desc, .type, h1 > .added {font-size:92%}
    dt, .argument {font-weight:bold}
    .added {float:right}
    ]]> + "</style>",
});

CmdUtils.CreateCommand({
  names: ["run selector-selector"],
  description: "" + (
    <ul style="list-style-image:none">
    <li>Lets you type a jQuery selector and highlights matched elements.</li>
    <li>Hovering on an element generates a matching selector.</li>
    </ul>),
  help: "" + [
    [<b>Enter / Left-click</b>,
     "Copy and Quit"],
    [<b><u>C</u> / Middle-click</b>,
     "Copy"],
    [<b><u>Q</u> / Esc / Right-click</b>,
     "Quit"],
    [<b><u>M</u></b>,
     "Move"],
    [<b><u>F</u></b>,
     "Force element names"],
    [<b>PageUp/PageDn</b>,
     "Scroll vertically"],
    [<b>shift + PageUp/PageDn</b>,
     "Scroll horizontally"],
    ].reduce(function (l, [t, d]) l.appendChild(<dt>{t}</dt> + <dd>{d}</dd>),
             <dl/>),
  authors: [{name: "cers",  email: "cers@geeksbynature.dk"},
            {name: "satyr", email: "murky.satyr@gmail.com"}],
  license: "MIT",
  icon: "chrome://ubiquity/skin/icons/jquery.ico",
  execute: function ss_execute() {
    const Me = this, Key = Me._key, Doc = CmdUtils.getDocument();
    if (Doc.getElementById(Key)) return;

    XML.prettyPrinting = XML.ignoreWhitespace = false;
    var $i = $(<iframe id={Key} src={Me._src} width="0"/>.toXMLString());
    Utils.listenOnce($i[0], "load", load)
    $(Doc.createElement("div"))
    .append($i, $("<style>" + Me._css.replace(/\$/g, Key) + "</style>"))
    .appendTo(Doc.body);

    function load() {
      var {contentDocument: IDoc, style: IStyle} = this;
      IStyle.top = IStyle.left = 0;
      var [ebox] = $("#edit", IDoc).keypress(onkey);
      breadcrumbs.lmnn = $("#lmnn", IDoc)[0];

      ebox.style.width = Doc.defaultView.innerWidth * .7;
      this.height = IDoc.documentElement.clientHeight;
      $i.animate({width: Doc.documentElement.clientWidth}, 333,
                 function focus_delayed() { Utils.setTimeout(focus) });
      Doc.addEventListener("mouseover", hover, true);
      Doc.addEventListener("click", click, true);
      IDoc.addEventListener("click", onbutton, false);

      function copy() { copydisp(ebox.value) }
      function focus() { ebox.focus() }
      function onbutton({target}) {
        switch (target.id) {
          case "quit": quit(); return;
          case "copy": copy(); break;
          case "move":
          var props = ["top", "bottom"], texts = ["\u2193", "\u2191"];
          var which = +/^0/.test(IStyle[props[0]]);
          IStyle[props[which ^ 1]] = "";
          IStyle[props[which ^ 0]] = 0;
          target.textContent = texts[which];
        }
        focus();
      }
      function onkey(e) {
        switch (e.keyCode) {
          case 33: // PageUp
          case 34: // PageDn
          scroll(.8 * (e.keyCode * 2 - 67), e.shiftKey);
          return halt(e);
          case 13: copy(); // Enter
          case 27: quit(); // Escape
          return halt(e);
        }
        var me = this;
        delay(function onkey_delayed() {
          if (me.v !== (me.v = me.value))
            me.style.fontStyle = hilite(me.value) ? "" : "oblique";
        }, 123);
      }
      function hover({target}) {
        if (target === $i[0]) return;
        delay(function hilite_delayed() {
          var path = breadcrumbs(target);
          hilite(path);
          ebox.value = path;
        }, 42);
      }
      function click(e) {
        if (e.button !== 2) copydisp(breadcrumbs(e.target));
        if (e.button !== 1) quit();
        return halt(e);
      }
      function halt(e) { e.preventDefault(); e.stopPropagation() }
      function quit() {
        Doc.removeEventListener("mouseover", hover, true);
        Doc.removeEventListener("click", click, true);
        $i.parent().remove();
        hilite({});
      }
    }
    function scroll(rate, horiz) {
      with (Doc.defaultView)
        scrollBy(innerWidth * rate * horiz, innerHeight * rate * !horiz);
    }
    function delay(cb, ms) {
      Utils.clearTimeout(delay.tid);
      delay.tid = Utils.setTimeout(cb, ms);
    }
    function breadcrumbs(it) {
      var doc = it.ownerDocument, htm = doc.documentElement, sels = [], i = -1;
      var flmnn = breadcrumbs.lmnn.checked;
      do {
        var lname = it.nodeName.toLowerCase();
        if (it.id) {
          sels[++i] = (flmnn ? lname : "") + "#" + it.id;
          break;
        }
        var m = (it.className.replace(Key, "")
                 .match(/[_a-zA-Z\u0080-\uffff][-\w\u0080-\uffff]{0,}/g));
        sels[++i] = m ? (flmnn ? lname : "") + "." + m.join(".") : lname;
      } while ((it = it.parentNode) !== htm && it !== doc);
      return sels.reverse().join(" > ");
    }
    function hilite(path) {
      (hilite.cache || $("." + Key, Doc)).removeClass(Key);
      try { hilite.cache = $(path, Doc).addClass(Key) }
      catch (_) { return false }
      return true;
    }
    function copydisp(txt) {
      txt && displayMessage(CmdUtils.copyToClipboard(txt), Me);
    }
  },
  _key: "_" + String.slice(Math.random(), 2),
  _css: <![CDATA[
    .$ {outline:2px blue solid;}
    #$ {position:fixed; z-index:2147483647; border:none; opacity:0.9;}
    ]]>.toString().replace(/;/g, " !important;"),
  _src: "data:text/html;charset=utf8," + encodeURIComponent(
    <body><style><![CDATA[
      body {display:inline-block; overflow:hidden; margin:0; background:menu}
      button {font-weight:bolder}
    ]]></style><nobr
    ><input id="edit"/><input id="lmnn" type="checkbox"
    title="Force element names" accesskey="f"></input
    ><button id="copy" title="Copy" accesskey="c"><u>C</u>opy</button
    ><button id="move" title="Move" accesskey="m">&#x2193;</button
    ><button id="quit" title="Quit" accesskey="q">&#xD7;</button
    ></nobr></body>),
});
