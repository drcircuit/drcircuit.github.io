const script = {
    name: 'script',
    level: 'block',
    start(src) { return src.match(/$[^:\n]/)?.index; },
    tokenizer(src) {
        const rule = /^(?:\$[^:\n].*\$[^:\n]*(?:\n|$))+/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'script',
                raw: match[0],
                text: match[0].trim(),
                tokens: []
            };
        }
    },
    renderer(token) {
        let scriptElement = createTag("script");
        let container = createTag("div")
        let options = getOptions(token);
        let defer = false;
        if(options.length > 0){
            options.forEach(o=>{
                if(o.includes("parent")){
                    createParentElementForScript(options, container);
                } else if(o.includes("defer")){
                    defer = true;
                }
            });
        }
        scriptElement.src = getScriptSrc(options);
        scriptElement.defer = defer;
        document.body.appendChild(scriptElement);
        return `<!--- script: ${scriptElement.src} added --->\n${container.innerHTML}`;
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
    let id = opts[1].split("=")[1].replace('"', "").replace('"', "");
    let parent = createTag("div", ["effect","arne"]);
    parent.id = id;
    container.appendChild(parent);
    return parent;
}
