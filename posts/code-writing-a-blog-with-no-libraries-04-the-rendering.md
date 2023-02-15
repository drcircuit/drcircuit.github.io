# Writing this blog without any libraries
## #4 - The rendering. 
_Let's tackle the rendering, how hard can that be, right?_

Yes my friends the day has come, we will need to do some rendering! Thankfully, I have allready decided to offload all the heavy lifting to a library. So I did say to write this without libraries, but this let's me show my point for this whole thing. My point is that we do not need libraries to handle user actions, state management and DOM manipulation. That is what JavaScript is invented to do. It is designed for that very purpose. My point is that we should try to see how far we come without resorting to using thousands of lines of 3rd party code before we absolutely need to, or it just makes sense with respect to cost, risk, time and resources. It is all a balancing act, and is something we should be concious and aware of when building systems. And now the time has come in this project, that I feel that writing a markdown compiler is not something I want to do at this point in time, when MarkedJS is pretty lean and does the job wonderfully. I also want it to be extensible, but more on why later.

We left off getting a link to the markdown file off the addressMap. That link is delegated to the renderPage function. 

```javascript
function renderPage(page) {
    let url = page.includes("/posts") ? `${page}` : `/pages${page}.md`;
    fetch(url)
        .then((d) => d.text())
        .then((md) => {
            pageContent.innerHTML = "";
            let pel = createTag("div", ["mdPage"],"")
            pel.innerHTML = marked.parse(md);
            pageContent.appendChild(pel);
        })
        .catch((e) => {
            console.error(e);
        });
}
```

So we start by figuring out if we need a page or post, if it is a page, we append the /pages folder to the link.
Next our trusty friend fetch does the loading of the file. We parse it as plain text, and create a container element.
Then we let MarkedJS render the markdown and voilá we have a rendered page!

![](blog-page-rendering.png ".img-fluid .mx-auto .d-block")

Let's add the syntax highliting to the Marked-pipeline with HighlightJS, this is done by adding a hook to the MarkedJS config
```javascript
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
```

The theme is chosen from one of the standard themes on the HighlightJS website, it is added as a linked CSS:
```html
<link rel="stylesheet" href="styles/nebula.css" />
```
Then I modified it to my liking!
Now we have fancy colored code on the blog!!

![](blog-code-highlighting.png ".img-fluid .mx-auto .d-block")

Next I want to render images, and I also want to be able to embed youtube videos on this thing. 
So what to do. Well MarkedJS let's you extend it's functionality. You can create custom elements, custom renderers, custom lexers and parsers pretty easilly. 
Let's build a custom renderer for images. I will use the standard image token for markdown and extend it to be able to add dimensions, classes and add a prefix "yt/" to indicate a youtube video to embed rather than an image. I can do so by creating a custom renderer for images:

```javascript
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
```
Now this method we can hook into MarkedJS pipeline by registering it:
```javascript
marked.use({ renderer: { image: imageRenderer } });
```

Again I have created helper functions for readability. You will probably see that a great deal on this blog. I am a firm believer that code should read like prose, and your intentions for writing the code should be clearly stated from the code itself. Such code has no need for comments that rarely get updated, the code itself is the documentation. I kinda like that. A great developer friend once told me: "You should write your code the way you would if you knew the next person who has to maintain it is a serial killer and knows where you live." All violence asside, it makes perfect sense. Good developers make their code understandable to others. 

The checkYoutubeVideo function is just a regex match to find the "yt/" prefix, if that is there, we know we want to build a youtube iframe, if not, we build a regular image tag.

```javascript
function checkYoutubeVideo(href) {
    return href.match(/yt\/(\w+)/i);
}
```

Next we build the correct starting tag:
```javascript
function buildStartTag(href, m, text) {
    if (href && m) {
        return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${m[1]}" title="WCH Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen`;
    }
    else {
        return `<img src="${imgRoute}${href}" alt="${text}"`;
    }
}
```

The magic happens in the buildAttributes function. This is where we figure out if we have a size constraint, we use the syntax "640x480", parse that out and set the height and width attributes. Next we set any other attributes, and we also pick up any CSS classes and build add them to the "class" attribute:

```javascript
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
function imageSizeToken() {
    return /^(\d+)x(\d+)$/;
}

function imageAttributeToken() {
    return /^(\w+)=([\w-]+)$/;
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
```

With that out of the way, we simply need to build the correct end tag, and we are golden! 
That is easy enough, we just use the iframe flag:

```javascript
function buildEndTag(iframe) {
    return iframe ? "></iframe > " : " > ";
}
```

Great we can now embed images and videos by using the following syntax:

```markdown
![](me.jpg "256x256 .rounded-circle .d-block .mx-auto alt='me'")
![](yt/x9H4KeH_PUw "800x350  .d-block .mx-auto")
```

Those will render like this:

![](me.jpg "256x256 .rounded-circle .d-block .mx-auto alt='me'")

![](yt/x9H4KeH_PUw "800x350 .d-block .mx-auto")

Next time we will extend MarkedJS to be able to add scripts!

_Written by The WorkingClassHacker_