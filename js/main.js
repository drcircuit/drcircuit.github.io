const pageContent = document.getElementById("page");
const blog = document.getElementById("blog");
let addressMap = {};
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-', // highlight.js css expects a top-level 'hljs' class.
    pedantic: false,
    gfm: true,
    breaks: false,
    sanitize: false,
    smartypants: false,
    xhtml: false
});

marked.use({ renderer: { image: imageRenderer } });
marked.use({ extensions: [script, faicon], walkTokens });

function renderPage(page) {
    let url = page.includes("/posts") ? `${page}` : `/pages${page}.md`;
    fetch(url)
        .then((d) => d.text())
        .then((md) => {
            pageContent.innerHTML = "";
            let pel = createTag("div", ["mdPage"], "")
            pel.innerHTML = marked.parse(md);
            pageContent.appendChild(pel);
        })
        .catch((e) => {
            console.error(e);
        });
}

function setElementDisplay(element, visible) {
    if (element) {
        if (visible) {
            element.classList.remove("d-none");
        } else {
            element.classList.add("d-none");
        }
    }
}

function parsePage(address) {
    let parts = address.split("#");
    if (parts.length > 1) {
        return addressMap[parts[1]];
    }
    return "";
}

function getTitle(parts) {
    let title = "";
    for (let i = 1; i < parts.length; i++) {
        title = `${title} ${parts[i].ucFirst()}`;
    }
    return title;
}

function mapPosts(posts) {
    let loadedPosts = [];
    posts.forEach((postFileName, index) => {
        let postDate = new Date();
        try {
            postDate = new Date(Number(postFileName.split("#")[1]) * 1000);
        } catch (e) {
            console.error(e);
        }
        let fileNameParts = getFileNameParts(postFileName);
        let postLink = getPostLink(fileNameParts, postFileName);
        let title = getTitle(fileNameParts);
        fetch(postFileName)
            .then((r) => r.text())
            .then((postText) => {
                let postCard = createPostCard(postText, fileNameParts, title, postDate, postLink);
                postCard.setAttribute("data-index", index);
                loadedPosts.push(postCard);
                if (loadedPosts.length === posts.length) {
                    loadedPosts.sort((a, b) => Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index")));
                    appendChildren(blog, loadedPosts);
                }
            })
            .catch(e => console.error);
    });
}

function getFileNameParts(postFileName) {
    let strippedPostFileName = postFileName.replace("/posts/", "").split(".");
    let fileNameParts = strippedPostFileName[0].split("-");
    return fileNameParts;
}

function getPostLink(fileNameParts, postPath) {
    let link = `/posts/${fileNameParts.join("-")}`;
    addressMap[link] = postPath;
    return link;
}

function createPostCard(txt, parts, title, dd, slug) {
    let { start, stop } = txt.getIndices("_");
    let ingress = txt.substring(start + 1, stop);
    let postCard = createTag("div", ["card"]);
    let postImage = createTag("img", ["card-img-top"], "", { alt: parts[0], src: `/images/${parts[0]}.png` });
    let postCardBody = createPostCardBody(title, parts, dd, ingress, slug);
    appendChildren(postCard, [postImage, postCardBody]);
    return postCard;
}

function createPostCardBody(title, parts, dd, ingress, slug) {
    let postCardBody = createTag("div", ["card-body"]);
    let postTitle = createTag("h5", [], title);
    let postBadge = createTag("span", ["badge", "rounded-pill", "bg-dark"], parts[0].ucFirst());
    let postDate = createTag("span", ["card-date"], `${dd.toLocaleString("nb-NO")}`);
    let postIngress = createTag("p", ["card-text"], ingress);
    let postLink = createTag("a", ["btn", "btn-primary", "float-end"], "Check Out", { href: `#${slug}` });
    appendChildren(postCardBody, [postTitle, postBadge, postDate, postIngress, postLink]);
    return postCardBody;
}

function loadBlog(cb) {
    fetch("/posts/posts.json")
        .then(r => r.json())
        .then(posts => {
            mapPosts(posts);
            cb();
        })
        .catch(e => cb(console.error(e)));
}

function handlePage(page) {
    if (page !== "" && page) {
        renderPage(page);
        setElementDisplay(pageContent, true);
        setElementDisplay(blog, false);
    } else {
        blog.innerHTML = "";
        setElementDisplay(blog, true);
        setElementDisplay(pageContent, false);
    }
}

function appendChildren(parent, children = []) {
    children.forEach(c => parent.appendChild(c));
}

function createTag(tag, classes = [], text = "", attributes = {}) {
    let el = document.createElement(tag);
    el.innerText = text;
    el.classList.add(...classes.filter(c => c));
    for (let attr in attributes) {
        // el[attr] = attributes[attr];
        el.setAttribute(attr, attributes[attr]);
    }
    return el;
}

function createDropDownMenuItem(e, entry) {
    let label = `${e}DropDown`;
    let li = createTag("li", ["nav-item", "dropdown"]);
    let a = createTag("a", ["nav-link", "dropdown-toggle"], e.ucFirst(), { href: "#", id: label, "role": "button", "data-bs-toggle": "dropdown", "aria-expanded": "false" });
    li.appendChild(a);
    let ul = createTag("ul", ["dropdown-menu"], "", { "aria-labelledby": label });
    entry.forEach(item => {
        let ili = createMenuItem(item, "dropdown-item");
        ul.appendChild(ili);
    });
    li.appendChild(ul);
    return li;
}

function createMenuItem(item, style = "nav-item") {
    let li = createTag("li", [style]);
    let a = createTag("a", ["nav-link"], item.text, { href: item.page });
    a.innerText = item.text;
    li.appendChild(a);
    return li;
}

function createMenuElements(pagelist) {
    let menu = document.getElementById("menu");
    menu.innerHTML = "";
    for (let e in pagelist) {
        let entry = pagelist[e];
        if (e === "main") {
            entry.forEach(item => {
                let li = createMenuItem(item);
                menu.appendChild(li);
            });
        }
        else {
            let li = createDropDownMenuItem(e, entry);
            menu.appendChild(li);
        }
    }
}

function mapMenu(list) {
    let menu = {};
    list.forEach((i) => {
        let parts = i.split("/").filter(p => p !== ".");
        if (!menu[parts[2]]) {
            menu[parts[2]] = [];
        }
        let menuKey = parts[2];
        let friendlyName = parts[3].replace(".md", "").replace(/\d\d-/, "").ucFirst();
        let link = i.replace("/pages", "/#").replace(".md", "").replace("/.", "");
        addressMap[`/${friendlyName}`] = link.replace("/#", "");
        menu[menuKey].push({
            page: `/#/${friendlyName}`,
            menuEntry: menuKey,
            text: friendlyName
        });
    });
    return menu;
}

function loadMenu(cb) {
    fetch("/pages/pages.json")
        .then((d) => d.json())
        .then((p) => {
            createMenuElements(mapMenu(p));
            cb();
        })
        .catch((e) => cb(console.error(e)));
}

function load() {
    loadMenu(() => {
        loadBlog(() => {
            handlePage(parsePage(window.location.href));
        });
    });
}

window.addEventListener("load", (e) => {
    load();
});

window.addEventListener("popstate", (e) => {
    load();
});

String.prototype.ucFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.getIndices = function (char) {
    let start = -1;
    let stop = -1;
    for (let i = 0; i < this.length; i++) {
        if (this[i] === char && start < 0) {
            start = i;
        } else if (this[i] === char && start > -1 && stop < 0) {
            stop = i;
            break;
        }
    }
    return { start: start, stop: stop };
}