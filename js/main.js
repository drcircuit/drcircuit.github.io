const content = document.getElementById('content');
let addressMap = {};
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        console.log(code, language);
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


function loadPage(page) {
    fetch(`/pages${page}.md`)
        .then((d) => d.text())
        .then((md) => {
            content.innerHTML = "";
            let pel = document.createElement("div");
            pel.className = "mdPage";
            pel.innerHTML = marked.parse(md);
            content.appendChild(pel);
        })
        .catch((e) => {
            console.error(e);
        });
}

function setBlogDisplay(visible) {
    let blog = document.getElementById("blog");
    if (blog) {
        blog.hidden = !visible;
    }
}

function parsePage(address) {
    let parts = address.split("#");
    console.log(parts);
    if (parts.length > 1) {
        return addressMap[parts[1]];
    }
    return "";
}

function mapPosts(posts){
    let blog = document.getElementById("blog");
    posts.forEach(p=>{
        let parst = p.split("-");
        let el = el("div");
        el.classList.add("card");
        el.style.width = "18rem";
        let img = el("img");
        img.src = ""
    });
}
function loadBlog(cb) {
    fetch("/posts/posts.json")
        .then(r => r.json())
        .then(posts => {
            console.log(posts);
            mapPosts(posts);
            cb();
        })
        .catch(e => cb(console.error(e)));
}

function handlePage(page) {
    if (page !== "" && page) {
        loadPage(page);
        setBlogDisplay(false);
    } else {
        loadBlog(() => {
            setBlogDisplay(true);
        });
    }
}

function el(tag) {
    return document.createElement(tag);
}

String.prototype.ucFirst = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function mapMenu(pagelist) {
    let menu = document.getElementById("menu");
    menu.innerHTML = "";
    for (let e in pagelist) {
        let entry = pagelist[e];
        if (e === "main") {
            entry.forEach(item => {
                let li = el("li");
                li.className = "nav-item";
                let a = el("a");
                a.className = "nav-link";
                a.href = item.page;
                a.innerText = item.text;
                li.appendChild(a);
                menu.appendChild(li);
            });
        }
        else {
            let li = el("li");
            li.classList.add("nav-item", "dropdown");
            let a = el("a");
            a.classList.add("nav-link", "dropdown-toggle");
            a.href = "#";
            let label = `${e}DropDown`
            a.id = label;
            a.innerText = e.ucFirst();
            a.setAttribute("role", "button");
            a.setAttribute("data-bs-toggle", "dropdown");
            a.setAttribute("aria-expanded", "false");
            li.appendChild(a);
            let ul = el("ul");
            ul.className = "dropdown-menu";
            ul.setAttribute("aria-labelledby", label);
            entry.forEach(item => {
                let ili = el("li");
                let ia = el("a");
                ia.className = "dropdown-item";
                ia.href = item.page;
                ia.innerText = item.text;
                ili.appendChild(ia);
                ul.appendChild(ili);
            });
            li.appendChild(ul);
            menu.appendChild(li);

        }
    }
}
function sortMenu(list) {
    let menu = {};
    list.forEach((i) => {
        let parts = i.split("/").filter(p => p !== ".");
        if (!menu[parts[2]]) {
            menu[parts[2]] = [];
        }
        let friendlyName = parts[3].replace(".md", "").replace(/\d\d-/, "").ucFirst();
        let link = i.replace("/pages", "/#").replace(".md", "").replace("/.", "");
        addressMap[`/${friendlyName}`] = link.replace("/#", "");
        menu[parts[2]].push({
            page: `/#/${friendlyName}`,
            menuEntry: parts[2],
            text: friendlyName
        });
    });
    return menu;
}

function loadMenu(cb) {
    fetch("/pages/pages.json")
        .then((d) => d.json())
        .then((p) => {
            mapMenu(sortMenu(p));
            cb();
        })
        .catch((e) => cb(console.error(e)));
}
function load() {
    loadMenu(() => {
        handlePage(parsePage(window.location.href));
    });
}
window.addEventListener("load", (e) => {
    load();
});
window.addEventListener("popstate", (e) => {
    load();
});