# Writing this blog without any libraries
## #5 - In scripts we trust!
_Ok, I want to show off graphical demos using JavaScript, let's write a custom extension to MarkedJS..._

$ src="https://cdn.jsdelivr.net/npm/drcircuitscanvaslibrary@1.4/dcl.min.js" $

So I love to program graphics demos and animations. I'm the kinda guy that just loves a good fractal or a couple of sinusoids. So how can I add scripts via markdown?
Well since MarkedJS is pretty extensible, and well-documented, it should be easy to write a custom lexer, parser and renderer for a script element.
But before we go and do something stupid, let's stop to think about what we are enabling. Aren't we creating a local file inclusion vulnerability? Yes, we are! Aren't we also enabling a code execution vulnerability? Absolutely! So is this a good idea? Well, that depends, if you are running this on a backend, hell no! Or at least you need to make sure you are sanitizing and controlling the user input thoroughly! But we don't have a backend! Nor do we have any servers, databases, password files, certificates or any other potential data that would pose a risk to our service or its users. So if you do an LFI attack against this blog, you can only include your files, because we are running client-side only! 1 point for no backends...

So we need to decide upon a syntax. I decide that scripts will be defined by two $ signs. 

```markdown
$ script.js $
```

I also want the ability to put the canvas element inside a parent, and I want to be able to set the defer flag to ensure load order.
So the final syntax will be:

```markdown
$ script.js $
$ script.js canvas=parent $
$ script.js canvas=parent defer
```
To get this going, we need to create an extension to MarkedJS that handles this syntax. Extensions to MarkedJS are pretty simple to build. They follow this template:

```javascript
const name = {
    name: 'name',
    level: 'block|inline',
    start(src) { },
    tokenizer(src) { },
    renderer(token) { }
};
```
MarkedJS uses a pipeline that is as follows:
1. You get an input string
2. The lexer feeds that string to the tokenizer
3. The tokenizer feeds tokens to the parser
4. The parser feeds the token into the renderer
5. The renderer manipulates the DOM to put the HTML elements on the screen

So we need to build that for our script block.

The start method tells the lexer where to find the start of the token:

```javascript
const script = {
    name: 'script',
    level: 'block',
    start(src) { return src.match(/$[^:\n]/)?.index; },
```
We just use a simple regex to look for a new line.

Next, we need to get out the token, that is from $ to $, we do that with a custom tokenizer:

```javascript
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
    }
```
We match whatever we find between two $ signs, again regex to the rescue. We create a token named "script" a return it. 

Next up is the renderer that should be fun:

```javascript
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
```
So again I have split the code up into helper functions. One to parse the options, one to create a parent element if those options are set, and one to get the script source value.

```javascript
function getOptions(token) {
    let opts = token.text.split(" ");
    opts.shift();
    opts.pop();
    return opts;
}
```

This just splits the string by spaces, removes the two dollar sign values at the start and end of the array, and returns the remaining values.

```javascript
function createParentElementForScript(opts, container) {
    let id = opts[1].split("=")[1].replace('"', "").replace('"', "");
    let parent = createTag("div", ["effect","arne"]);
    parent.id = id;
    container.appendChild(parent);
    return parent;
}

```

If we need to create a parent container, we use this utility function to create the element. We get the Id value from the right side of the equal sign. and we append it to the outer container. To render the script with the effect inside this, we need to handle that in the script itself, which is beyond the scope of this piece of code. It is only responsible for creating the element and making it available to the script.

Finally, we get the src of the script:
```javascript
function getScriptSrc(opts) {
    return opts[0].split("=")[1].replace('"', "").replace('"', "");
}
```
This is simply the first option - it is our tokenizer, and we can make the rules!

This should make this work:
```markdown
$ src=/js/demoscene/fireCube/fireCube.js parent=3dcube defer $
```
$ src=/js/demoscene/fireCube/fireCube.js parent=3dcube defer $