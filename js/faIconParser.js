function parseIcon(token) {
    let parts = token.split(" ");
    let catalog = parts[0].replace("i(", "");
    let icon = parts[1];
    let text = parts.length > 3 ? parts[3].replace(")","") : parts[2].replace(")","");
    let link = parts.length > 3 ? parts[2] : "";
    return {
        catalog: catalog,
        icon: icon,
        link: link,
        text: text
    };
}
const faicon = {
    name: 'faicon',
    level: 'inline',
    start(src) { return src.match(/$[^:\s]/)?.index; },
    tokenizer(src) {
        const rule = /(i\([^)]*\))/;
        const match = rule.exec(src);
        if (match) {
            const token = {
                type: 'faicon',
                raw: match[0],
                text: match[0].trim(),
                tokens: []
            };
            return token;
        }
    },
    renderer(token) {
        let icon = parseIcon(token.text);

        let tag = `<span class="${icon.catalog} ${icon.icon}"></span>`;
        if(icon.link === ""){
            return tag;
        } else {
            return `<a class="large-icon" href="${icon.link}">${tag}</a>`;
        }
    } 
};

function walkTokens(token) {  
    console.log(token);                      // Post-processing on the completed token tree
    if (token.type === 'text' && token.text.substring(0,2) === "h)") {
        token.text = "";
    }
  }