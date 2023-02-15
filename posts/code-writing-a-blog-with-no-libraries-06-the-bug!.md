# Writing this blog without any libraries
## #6 - The bug! 
_So you may have spotted it, but if not, let's fix a bug!_

So we have reached the part of this project where we need to finalize the last part, which is the listing of the blog posts. 
I thought that would be easy enough, but as it turns out there were a few problems, but let's go through the development as I did.

As with the pages, we load the posts.json file using the Fetch API:

```javascript
function loadBlog(cb) {
    fetch("/posts/posts.json")
        .then(r => r.json())
        .then(posts => {
            mapPosts(posts);
            cb();
        })
        .catch(e => cb(console.error(e)));
}

function load() {
    loadMenu(() => {
        loadBlog(() => {
            handlePage(parsePage(window.location.href));
        });
    });
}
```

We load the JSON file, map the posts, and call back to the load function to handle any chosen page to view. So far so good.

```javascript
function createPostCardBody(title, parts, dd, slug) {
    let postCardBody = createTag("div", ["card-body"]);
    let postTitle = createTag("h5", [], title);
    let postBadge = createTag("span", ["badge", "rounded-pill", "bg-dark"], parts[0].ucFirst());
    let postDate = createTag("span", ["card-date"], `${dd.toLocaleString("nb-NO")}`);
    let postLink = createTag("a", ["btn", "btn-primary", "float-end"], "Check Out", { href: `#${slug}` });
    appendChildren(postCardBody, [postTitle, postBadge, postDate, postLink]);
    return postCardBody;
}

function createPostCard(parts, title, dd, slug) {
    let postCard = createTag("div", ["card"]);
    let postImage = createTag("img", ["card-img-top"], "", { alt: parts[0], src: `/images/${parts[0]}.png` });
    let postCardBody = createPostCardBody(title, parts, dd, ingress, slug);
    appendChildren(postCard, [postImage, postCardBody]);
    return postCard;
}

function mapPosts(posts) {
    posts.forEach((postFileName) => {
        let postDate = new Date();
        try {
            postDate = new Date(Number(postFileName.split("#")[1]) * 1000);
        } catch (e) {
            console.error(e);
        }
        let fileNameParts = getFileNameParts(postFileName);
        let postLink = getPostLink(fileNameParts, postFileName);
        let title = getTitle(fileNameParts);
        let postCard = createPostCard(fileNameParts, title, postDate, postLink);
        appendChildren(blog, loadedPosts);
    });
}
```
So the convention here is that post filenames have a prefix which corresponds to an illustration, next comes the title, then we get the timestamp. 
Now this works, but it doesn't give me what I want. I want to see some lead text as well as the title and date of the post. We need to read the actual post and pick some of the text to use as a lead text. I decide to use a paragraph marked with _ _ for italic text as the lead section. The only way to get this text is to load each post and pull the text out. That should be easy enough:

```javascript
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

function createPostCard(txt, parts, title, dd, slug) {
    let { start, stop } = txt.getIndices("_");
    let ingress = txt.substring(start + 1, stop);
    let postCard = createTag("div", ["card"]);
    let postImage = createTag("img", ["card-img-top"], "", { alt: parts[0], src: `/images/${parts[0]}.png` });
    let postCardBody = createPostCardBody(title, parts, dd, ingress, slug);
    appendChildren(postCard, [postImage, postCardBody]);
    return postCard;
}

function mapPosts(posts) {
    posts.forEach(postFileName => {
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
            .then(postText => {
                let postCard = createPostCard(postText, fileNameParts, title, postDate, postLink);
                postCard.setAttribute("data-index", index);
                appendChildren(blog, postCard);
            })
            .catch(e => console.error);
    });
}
```

First I create a helper method extension to find the first two indices of the _ character. This is used by the createPostcard function to pull out the lead text from the post. Then that text and the rest of the elements are created, and we append the postcard element to the blog. Now this works, but there is a problem here.
We have a race condition because the calls to fetch resolve asynchronously. So that means that the posts may return out of order, and we will have an messy list of posts.
Well, you could call it a feature, like a way to ensure dynamic content - very SEO of us... But I call it a bug, and we need to fix it! You may have noticed it if you viewed the blog earlier this week.

The fix is pretty easy, there are many ways to handle this, but I chose to put all the post elements in an array, add a custom attribute with their index, then sort the array on that attribute before appending the posts, this works. We can't just use the index and put it into the array because in Javascript if you insert something into a certain index in an array, it will affect the length of that array. So we need a different way to handle this:

```javascript
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
```
So we have our array named "loadedPosts" and we only append the elements after we naively have resolved all promises. Now depending on your solution and how you load stuff this may or may not be sufficient. I know my posts are there, because I load them from static files, so I can afford to be naive here. But this code is fragile if you have transient errors, like one request doesn't resolve, then we will get nothing displayed. For now I accept this limitation and risk - but we may need to handle this at some point.

Now that we have a way to display posts we need to handle if we are showing a page, a post or a list of posts. To render the post, we reuse our function to render pages, this is why we chose markdown, and we have written that previously, so it should work out of the box:
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
So that is fine, and it works.
So we need to show the blog post list when we are not viewing a post or a page, and at the same time hide the page container, and the other way around when we are viewing a post or a page.

So I came up with this solution:
```javascript
function setElementDisplay(element, visible) {
    if (element) {
        if (visible) {
            element.classList.remove("d-none");
        } else {
            element.classList.add("d-none");
        }
    }
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
```
So the setElementDisplay toggles the d-none class which comes from bootstrap and sets the display style property to "none" this hides the element.
Then we set the correct elements to be visible and hidden depending on what we are viewing. 

Great! Now we have blog posts!

![](blog-post-list.png ".img-fluid .mx-auto .d-block")

And we can render this post:
![](blog-post-rendered.png ".img-fluid .mx-auto .d-block")

This series of how I created this blog without libraries is near its conclusion. I will extend this blog system with more features as time progresses to suit my needs.
The full source is available on Github:

https://github.com/drcircuit/drcircuit.github.io

You are free to copy, change and mangle the code to suit your own needs. I wrote this as an exercise to see how far you can get without reverting back to the big gun front libraries. And I was suprised! I have been working with frameworks and libraries for so long, I had forgotten how versatile, expressive and useful JavaScript is. I hope that you too see that you do not need a library like React to build a blog, nor do you need a backend in Node or NextJS, nor do you need any dynamic web features. 

In the next and final post, I will show you how I actually build, deploy and host it! 

_Written by The WorkingClassHacker_
