let imgRoute = "/images/";
let xhtml = false;

function imageRenderer(href, title, text) {
    console.log(href, title, text);
    let out, iframe,m;

    if (href && (m = href.match(/yt\/(\d+)/i))) {
        iframe = true;
        out = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${m[1]}" title="WCH Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen`;
    }
    else {
        out = `<img src="${imgRoute}${href}" alt="${text}"`;
    }

    let a = (title && title.split(/\s+/)) || [];
    let b = [];
    let classNames = [];
    a.forEach(function (w) {
        if ((m = w.match(/^(\d+)x(\d+)$/))) return (out += ' width="' + m[1] + '" height="' + m[2] + '"');
        if ((m = w.match(/^(\w+)=([\w-]+)$/))) {
            if (m[1] === 'class') return classNames.push(m[2]);
            return (out += ' ' + m[1] + '="' + m[2] + '"');
        }
        if ((m = w.match(/^\.([\w-]+)$/))) return classNames.push(m[1]);
        if (w) return b.push(w);
    });

    if (classNames.length) {
        out += ' class="' + classNames.join(' ') + '"';
    }

    title = b.join(' ');

    if (title) {
        out += ' title="' + title + '"';
    }

    out += iframe ? '></iframe>' :
        xhtml ? '/>' :
            '>';

    return out;
}