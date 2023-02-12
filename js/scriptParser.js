const script = {
    name: 'script',
    level: 'block',
    start(src) { return src.match(/$[^:\n]/)?.index; },
    tokenizer(src) {
        const rule = /^(?:\$[^:\n].*\$[^:\n]*(?:\n|$))+/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'script',
                raw: match[0],
                text: match[0].trim(),
                tokens: []
            };
            this.lexer.inline(token.text, token.tokens);
            return token;
        }
    },
    renderer(token) {
        let scriptElement = document.createElement("script");
        let container = document.createElement("div");
        let options = getOptions(token);
        if (options.length === 2) {
            createParentElementForScript(options, container);
        }
        scriptElement.src = getScriptSrc(options);
        document.body.appendChild(scriptElement);
        return `<!--- script: ${scriptElement.src} added --->\n${container.innerHTML}`; //`<script type="text/javascript" ${opt[0]}></script>`; // parseInline to turn child tokens into HTML
    }
};
function getScriptSrc(opts) {
    return opts[0].split("=")[1].replace('"', "").replace('"', "");
}
function getOptions(token) {
    let opts = token.text.split(" ");
    opts.shift();
    opts.pop();
    return opts;
}
function createParentElementForScript(opts, container) {
    let parent;
    parent = document.createElement("div");
    let par = opts[1].split("=")[1].replace('"', "").replace('"', "");
    parent.id = par;
    parent.classList.add("effect");
    container.appendChild(parent);
}
