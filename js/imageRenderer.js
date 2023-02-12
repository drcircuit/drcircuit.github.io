let imgRoute = "/images/";

function imageRenderer(href, title, text) {
    let html, iframe;
    let youtubeMatch = checkYoutubeVideo(href);
    if (youtubeMatch) {
        iframe = true;
    }
    html = buildStartTag(href, youtubeMatch, text);
    html += buildAttributes(title, youtubeMatch);
    html += buildEndTag(iframe);
    return html;
}

function buildStartTag(href, m, text) {
    if (href && m) {
        return `<iframe src="https://www.youtube.com/embed/${m[1]}" title="WCH Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen`;
    }
    else {
        return `<img src="${imgRoute}${href}" alt="${text}"`;
    }
}

function buildAttributes(title, m) {
    let html = "";
    let tokens = (title && title.split(/\s+/)) || [];
    let titleParts = [], classNames = [];
    tokens.forEach(function (w) {
        if ((m = w.match(imageSizeToken()))) {
            return html = `${html} width="${m[1]}" height="${m[2]} "`;
        }
        if ((m = w.match(imageAttributeToken()))) {
            if (m[1] === 'class')
                return classNames.push(m[2]);
            return html = `${html} ${m[1]}="${m[2]}"`;
        }
        if ((m = w.match(/^\.([\w-]+)$/)))
            return classNames.push(m[1]);
        if (w)
            return titleParts.push(w);
    });
    html += buildClasses(classNames);
    html += buildTitle(titleParts);
    return html;
}

function imageAttributeToken() {
    return /^(\w+)=([\w-]+)$/;
}

function imageSizeToken() {
    return /^(\d+)x(\d+)$/;
}

function buildClasses(classNames) {
    let output = "";
    if (classNames.length) {
        output += ` class="${classNames.join(" ")}"`;
    }
    return output;
}

function buildTitle(parts) {
    let ouput = "";
    let title = parts.join(' ');

    if (title) {
        ouput += `title="${title}"`;
    }
    return ouput;
}

function buildEndTag(iframe) {
    return iframe ? "></iframe > " : " > ";
}

function checkYoutubeVideo(href) {
    return href.match(/yt\/(\w+)/i);
}

