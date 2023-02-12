# Writing this blog without any libraries
## #1 - The ToDo app. 
_Let me tell you about this idea I had. Let's try to write software without libraries!_

## Say what?!
Ok, before you start your cancelling tweets, hear me out. Programming as a profession is a growing beast, and the programmers are getting more and more dependent on other peoples pieces of code. 

Don't believe me? Write a quick To-Do app in React, Angular or whatever SPA-framework you choose, then compile and see how much code ends up in your application. It is borderline ridiculus for such an app.

## To-Do React

### index.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
```

### site.css
```css
.App {
  text-align: center;
}

body {
  background-color: #333;
  color: #eee;
}

h1 {
  font-size: 3em;
  color: #3ef;
}

.taskBg {
  background-color: #666;
  border-radius: 6px;
  text-align: left;
  padding: 1.2rem;
  margin-bottom: 1em;
  position: relative;
  font-size: 1.5rem;
}

.btn:nth-child(2){
  margin-left: 20px;
}
.taskBg div{
  display: flex;
  align-items: center;
}

.taskBg .taskText {
  flex: 1;
  margin-left: 1em;
  max-width: 80%;
}

.done .taskText {
  text-decoration: line-through;
  color: #0F0;
}
.done{
  background-color: #444;
}

.taskNumber {
  color: #bbb;
  border: 1px solid #bbb;
  border-radius: 50%;
  display: flex;
  width: 32px;
  height: 32px;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-size: 1rem;
}
.icons{
  position: absolute;
  right: 10px;
  top: 50%;
  width: auto;
  display:inline-block;
  transform: translateY(-50%);

}

.icons span{
  margin: 0px 0px 0px 0.9em;
  cursor: pointer;
  color: #0f9;
}
.icons span:hover{
  color: #f2f;
}
.icons span.done{
  color: #0f0;
}
```
### app.js
```javascript
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faPen, faTrashCan } from "@fortawesome/free-solid-svg-icons";

import './App.css';

function App() {
  const [toDos, setToDos] = useState([
  ]);

  const [newTask, setNewTask] = useState("");
  const [updatingTask, setUpdatingTask] = useState("");

  const addTask = () => {
    const task = { id: toDos.length + 1, title: newTask, complete: false };
    setToDos([...toDos, task]);
    setNewTask("");
  }

  const deleteTask = (id) => {
    const tasks = toDos.filter((t) => t.id !== id);
    setToDos(tasks);
  }

  const completeTask = (id) => {
    let newToDos = toDos.map((t) => {
      if (t.id === id) {
        t.complete = !t.complete;
      }
      return t;
    });
    setToDos(newToDos);
  }

  const cancelUpdate = () => {
    setUpdatingTask("");
  }

  const updateTask = () => {
    let updated = toDos.map((t) => {
      if (t.id === updatingTask.id) {
        t = { ...updatingTask };
      }
      return t;
    });
    setToDos(updated);
    setUpdatingTask("");
  }

  const taskChanged = (e) => {
    updatingTask.title = e.target.value;
    setUpdatingTask({ ...updatingTask });
  }

  return (
    <div className="App container">
      <h1>ToDo</h1>
      {updatingTask !== "" ? (
        <div className="row">
          <div className="col">
            <input value={updatingTask.title} onChange={taskChanged} className="form-control form-control-lg" />
          </div>
          <div className="col-auto">
            <button onClick={updateTask} className="btn btn-lg btn-success">
              Update
            </button>
            <button onClick={cancelUpdate} className="btn btn-lg btn-danger">
              Cancel
            </button>
          </div>
        </div>) : (
        <div className="row">
          <div className="col">
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} className="form-control form-control-lg" />
          </div>
          <div className="col-auto">
            <button onClick={addTask} className="btn btn-lg btn-success">
              Add Task
            </button>
          </div>
        </div>
      )}
      <br />
      {toDos.length === 0 ? "No tasks" : ""}
      {toDos
        .sort((a, b) => a.id - b.id)
        .map((task, index) => {
          return (
            <React.Fragment key={task.id}>
              <div className={(task.complete ? "done" : "") + " row taskBg"}>
                <div>
                  <span className="taskNumber">{index + 1}</span>
                  <span className="taskText">{task.title}</span>
                </div>
                <div className="icons">
                  <span className={task.complete ? "done" : ""} title="mark complete" onClick={() => completeTask(task.id)}>
                    <FontAwesomeIcon icon={faCircleCheck} />
                  </span>
                  {task.complete ? "" : (
                    <span title="edit" onClick={() => setUpdatingTask({ ...task })}>
                      <FontAwesomeIcon icon={faPen} />
                    </span>
                  )}
                  <span title="delete" onClick={() => deleteTask(task.id)}>
                    <FontAwesomeIcon icon={faTrashCan} />
                  </span>
                </div>
              </div>
            </React.Fragment>
          )
        })}
    </div >
  );
}
export default App;
```

We get the following app:

![](todo-react.png ".img-fluid .img-fluid .mx-auto .d-block")
Which looks good, and it works. The code is also pretty easy to understand, however I must say that I am not a fan of all the inline ternary operators to hide/show portions of the UI. Also it takes some getting used to how React manages state. For instance, it requires a new reference to detect changes, rather than mutations in the object itself. Which I get, but it is not explicitly stated in the documentation.

If we compile that for production, we end up with this in the output directory:

![](todo-react-code.png ".img-fluid .img-fluid .mx-auto .d-block")

Yikes! 218KB of code!! Why?! My code was 228 lines long! 

Let's open it up in VS Code and look at what is going on.

![](todo-react-code-lines.png ".img-fluid .img-fluid .mx-auto .d-block")

OMG! That is 11758 lines of code! My 228 lines are not even there anymore, it has been transpiled, obfuscated and optimized. I can debug my code in the browser through the 1.6MB of source map that contains debug symbols for my original code. But why do we need that much code to run my little To-Do app? 

Well the answer to that is the framework we've chosen. All the state-handling, event-handling, DOM-manipulation, JSX-parser/lexer/compiler and so on have to be baked into your application. This is equivalent to staticly linking to libraries in native languages. Baking all the necessary code to run the functions you've linked to into your binary. Another approach would be have the runtime as a separate piece of code. This can be added to your app with a script tag. This is the same as dynamically linking. You need the code to be available to the runtime environment, but not compiled together with your code.

But do we really need libraries to get this To-Do app up and running? All we need is the ability to handle state, manipulate the dom, and react to user actions. Wasn't that the very thing JavaScript was invented to do? Have we evolved into a planet full of framework dependent developers that we no longer possess the ability to create applications without using other peoples code as a platform?

Let's try and create this with plain vanilla JavaScript, and no libraries. Well I will include Bootstrap 5 and FontAwesome - those were also part of the React version, so I think it is fair to be allowed them. I will however not use any other libraries, not even JQuery. I will only use native browser APIs. 

Let's start with the HTML, this is the index.html file:

```HTML
<!DOCTYPE html>
<html>

<head>
    <title>Todo App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <link rel="stylesheet" href="styles.css">
    <script src="https://kit.fontawesome.com/05cfaa33b5.js" crossorigin="anonymous"></script>
</head>

<body>
    <div class="container">
        <h1>Todo App</h1>
        <div id="addForm" class="row">
            <div class="col">
                <input class="form-control form-control-lg" type="text" id="addTitle" />
            </div>
            <div class="col-auto">
                <button class="btn btn-lg btn-success" onClick="addTask()"">Add Todo</button>
            </div>
        </div>
        <div id="editForm" class="row">
                    <div class="col">
                        <input class="form-control form-control-lg" type="text" id="editTitle" />
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-lg btn-success" onClick="updateTask()">Update</button>
                        <button class="btn btn-lg btn-danger" onClick="cancelUpdate()">Cancel</button>

                    </div>
            </div>
            <br />
            <div class="row" id="todos"></div>
        </div>
        <script src="app.js"></script>
</body>
</html>
```

We can see the structure is pretty much the same as the react app, the only difference is that instead of spraying the JSX template with different conditionals, and having half of the HTML inside the different source files, we have everything in one single file, and only HTML. We bind the button events to JavaScript actions, and you can see that we do not load any libraries, other than the CSS portion of Bootstrap, and a FontAwesome kit. 

We use mostly the same styles as the React App, here is styles.css:

```CSS
.App {
    text-align: center;
  }
  
  body {
    background-color: #333;
    color: #eee;
    text-align: center;
  }
  
  h1 {
    font-size: 3em;
    color: #3ef;
  }
  
  .taskBg {
    background-color: #666;
    border-radius: 6px;
    text-align: left;
    padding: 1.2rem;
    margin-bottom: 1em;
    position: relative;
    font-size: 1.5rem;
  }
  
  .btn:nth-child(2){
    margin-left: 20px;
  }
  .taskBg div{
    display: flex;
    align-items: center;
  }
  
  .taskBg .taskText {
    flex: 1;
    margin-left: 1em;
    max-width: 80%;
  }
  
  .done .taskText {
    text-decoration: line-through;
    color: #0F0;
  }
  .done{
    background-color: #444;
  }
  
  .taskNumber {
    color: #bbb;
    border: 1px solid #bbb;
    border-radius: 50%;
    display: flex;
    width: 32px;
    height: 32px;
    justify-content: center;
    text-align: center;
    align-items: center;
    font-size: 1rem;
  }
  .icons{
    position: absolute;
    right: 10px;
    top: 50%;
    width: auto;
    display:inline-block;
    transform: translateY(-50%);
  
  }
  
  .icons svg{
    margin: 0px 0px 0px 0.9em;
    cursor: pointer;
    color: #0f9;
  }
  .icons svg:hover{
    color: #f2f;
  }
  .icons svg.done{
    color: #0f0;
  }
```

Nothing special going on here, we just define the look and feel of the app.

Here comes the juicy bit, let's dive into the JavaScript. 
I know I will need a global object to hold the state of the todo list. So I create an empty array to hold the to-do items. I also know I want to manipulate the DOM by showing and hiding the two forms to do either editing or adding of the todos so I need a flag to know if I am currently editing, to show or hide the correct form.:

```javascript
let todos = [];
let editing = false;
```

Now let's put those things to the test. I add a function to show or hide a form by id. This is easy:

```javascript
function toggleForm(form, show) {
    document.getElementById(form).hidden = show;
}
```
Nothing overly complicated there.
I also know that when I load the page for the first time, I want to show the form for adding todos, and hide the form for editing todos. So I initialize the flag to "false". 

Let's create a function to show/hide a given form, and add a onLoad action to show the correct form based on the flag.

```javascript
function toggleForm(form, hidden) {
    document.getElementById(form).hidden = hidden;
}

function loadTodos() {
    toggleForm("addForm", editing);
    toggleForm("editForm", !editing);
}

window.addEventListener("load", () => {
    loadTodos();
});
```
That will show the add Todo form, and gives us this app:

![](todo-vanilla-load.png ".img-fluid")

Awesome, now let's add some todo's and add some routines to show them. We need to manipulate the DOM by creating elements and appending them to our page.

I create a generic createTag function, to be able to create different kinds of elements, with attributes, classes and content. 

```javascript
function createTag(tag, classes = [], text = "", attributes = {}) {
    let el = document.createElement(tag);
    el.innerText = text;
    el.classList.add(...classes.filter(c => c));
    for (let attr in attributes) {
        el[attr] = attributes[attr];
    }
    return el;
}
```

This function creates a DOM element, you can specify the CSS classes in an array of strings, the innerText and custom attributes.

Let's create a function to create the todo DOM element, just like we did in our React loop.
We can't use JSX syntax, so we will need to use our createTag function:

```javascript
function createTodoElement(t) {
    let todoElement = createTag("div", ["row", "taskBg", t.complete ? "done" : ""]);
    let todoContent = createTag("div");
    let todoId = createTag("span", ["taskNumber"], t.id + 1);
    let todoTitle = createTag("span", ["taskText"], t.task);
    todoContent.appendChild(todoId);
    todoContent.appendChild(todoTitle);
    todoElement.appendChild(todoContent);
    todoElement.appendChild(createTodoIcons(t.id, t.task, t.complete));
    return todoElement;
}
```

I also create a couple of functions to create the icons, this is just to make things more readable and keep the functions short. This is my personal preference. I prefer to keep functions to a maximum of 12-15 lines. I feel the code is more readable that way. Because source code is 90% for humans, and not machines.

```javascript
function createIcon(icon, evt) {
    let iconElement = createTag("span"); //FA removes mouse events, so we need to wrap it
    iconElement.appendChild(createTag("span", ["fa-solid", icon]));
    if (evt) {
        iconElement.addEventListener("click", evt);
    }
    return iconElement;
}

function createTodoIcons(id, task, complete) {
    let iconsElement = createTag("div", ["icons"]);
    iconsElement.appendChild(createIcon("fa-circle-check", () => { toggleTask(id) }));
    if (!complete) {
        iconsElement.appendChild(createIcon("fa-pen", () => { editTask(id, task) }));
    }
    iconsElement.appendChild(createIcon("fa-trash-can", () => { deleteTask(id) }));
    return iconsElement;
}
```

Again pretty simple, we utilize our createTag function to create this structure per todo-item, and return the root element:

```HTML
<div class="row taskBg">
  <div class="">
    <span class="taskNumber">1</span>
    <span class="taskText">A todo item</span>
  </div>
  <div class="icons">
    <span class="">
      <span class="fa-solid fa-circle-check"></span> 
    </span>
    <span class="">
      <span class="fa-solid fa-pen"></span>
    </span>
    <span class="">
      <span class="fa-solid fa-trash-can"></span>
    </span>
  </div>
</div>
```

Notice we need to wrap the fontawesome icons, this is because FontAwesome removes mouse events by default, so wrapping them in a span gives us the ability to attach mouse event listeners. Which we want, since these icons are represent user UI actions. I also want the edit button to only be visible if the item is not completed, so I add a flag for that in the createIcons functions.

Let's update the loadTodos function to add todos to the UI on every call if they are present in the global todo array:

```javascript
function loadTodos() {
    let todoListContainer = document.getElementById("todos");
    todoListContainer.innerHTML = "";
    todos.forEach(t => {
        let todoElement = createTodoElement(t);
        todoListContainer.appendChild(todoElement);
    });
    toggleForm("addForm", editing);
    toggleForm("editForm", !editing);
}
```

There are ofcourse many different ways we could do this. I like this. This clears the UI state, and rebuilds it once called. Let's add an action to add a todo item. The action is allready hooked up in the HTML on the Add button, we just need to implement it:

```javascript
function addTask() {
    let title = document.getElementById("addTitle");
    todos.push({ id: todos.length, task: title.value, complete: false });
    title.value = "";
    loadTodos();
}
```

That is easy enough, we get a reference to the input element, get the value, create a new todo item, clear the form and run the loadTodos function.

We are now able to add todos:

![](todo-vanilla-todos-add.png ".img-fluid .mx-auto .d-block")

Let's add the delete action, it should be pretty easy:

```javascript
function deleteTask(id) {
    todos = todos.filter((t) => t.id !== id);
    loadTodos();
}
```

Filter out the unwanted element, and reload the todos - just like in React!

The same goes for toggling the completed status:

```javascript
function toggleTask(id) {
    todos = todos.map((t) => {
        if (t.id === id) {
            t.complete = !t.complete;
        }
        return t;
    });
    loadTodos();
}
```
Just like in React we toggle the complete flag. This flag is what controls the visiblity of the edit icon, and the presence of the "done" css class on the item element.

The action allready hooked up in the UI by the createIcons function, so let's test it out!

![](todo-vanilla-todos-complete.png ".img-fluid .mx-auto .d-block")

Yay, now we just need to add the ability to edit todos, well there is one thing we need to figure out. How do we know what specific todo item we are editing? Well an easy way would be to update the form to have a hidden element containing the id as a value. We can do it HTML, or we can do i programatically. I chose the latter:

```javascript
function editTask(id, task) {
    editTitle.value = task;
    let idEl = createTag("input", [], "", { "id": "taskId", "type": "hidden", "value": id });
    editForm.appendChild(idEl);
    editing = true;
    loadTodos();
}
```
We create a hidden input telement, and add the id of the todo-item to the value.

Then we update the flag and reload the todos, this is what that looks like:

![](todo-vanilla-todos-edit.png ".img-fluid .mx-auto .d-block")

Let's do the cleanup in the cancel edit action:

```javascript
function clearEditForm() {
    let id = document.getElementById("taskId");
    editForm.removeChild(id);
    editTitle.value = "";
    editing = false;
    loadTodos();
}
```

This is pretty simple, we start by removing the id element from the form, then we reset the values in the form, switch the editing flag and reload.

Now we just need to be able to save the updated value and we are done:

```javascript
function updateTask() {
    let id = document.getElementById("taskId");
    todos = todos.map((t) => {
        if (t.id.toString() === id.value) {
            t.task = editTitle.value;
        }
        return t;
    });
    clearEditForm(); 
}
```
So we get the id, we map through the todo array and update the todo item matching the given id. Then we update the list of todos, clean up the form, and that cleanup does the reload for us. 

That completes the app. 

This is the final JavaScript:

```javascript
let todos = [];
let editing = false;

function createTag(tag, classes = [], text = "", attributes = {}) {
    let el = document.createElement(tag);
    el.innerText = text;
    el.classList.add(...classes.filter(c => c));
    for (let attr in attributes) {
        el[attr] = attributes[attr];
    }
    return el;
}

function createTodoElement(t) {
    let todoElement = createTag("div", ["row", "taskBg", t.complete ? "done" : ""]);
    let todoContent = createTag("div");
    let todoId = createTag("span", ["taskNumber"], t.id + 1);
    let todoTitle = createTag("span", ["taskText"], t.task);
    todoContent.appendChild(todoId);
    todoContent.appendChild(todoTitle);
    todoElement.appendChild(todoContent);
    todoElement.appendChild(createTodoIcons(t.id, t.task, t.complete));
    return todoElement;
}

function createIcon(icon, evt) {
    let iconElement = createTag("span"); //FA removes mouse events, so we need to wrap it
    iconElement.appendChild(createTag("span", ["fa-solid", icon]));
    if (evt) {
        iconElement.addEventListener("click", evt);
    }
    return iconElement;
}

function createTodoIcons(id, task, complete) {
    let iconsElement = createTag("div", ["icons"]);
    iconsElement.appendChild(createIcon("fa-circle-check", () => { toggleTask(id) }));
    if (!complete) {
        iconsElement.appendChild(createIcon("fa-pen", () => { editTask(id, task) }));
    }
    iconsElement.appendChild(createIcon("fa-trash-can", () => { deleteTask(id) }));
    return iconsElement;
}

function toggleForm(form, hidden) {
    document.getElementById(form).hidden = hidden;
}

function addTask() {
    let val = document.getElementById("addTitle");
    todos.push({ id: todos.length, task: val.value, complete: false });
    val.value = "";
    loadTodos();
}

function deleteTask(id) {
    todos = todos.filter((t) => t.id !== id);
    loadTodos();
}

function toggleTask(id) {
    todos = todos.map((t) => {
        if (t.id === id) {
            t.complete = !t.complete;
        }
        return t;
    });
    loadTodos();
}

function editTask(id, task) {
    editTitle.value = task;
    let idEl = createTag("input", [], "", { "id": "taskId", "type": "hidden", "value": id });
    editForm.appendChild(idEl);
    editing = true;
    loadTodos();
}

function clearEditForm() {
    let id = document.getElementById("taskId");
    editForm.removeChild(id);
    editTitle.value = "";
    editing = false;
    loadTodos();
}

function updateTask() {
    let id = document.getElementById("taskId");
    todos = todos.map((t) => {
        if (t.id.toString() === id.value) {
            t.task = editTitle.value;
        }
        return t;
    });
    clearEditForm(); 
}

function loadTodos() {
    let todoListContainer = document.getElementById("todos");
    todoListContainer.innerHTML = "";
    todos.forEach(t => {
        let todoElement = createTodoElement(t);
        todoListContainer.appendChild(todoElement);
    });
    toggleForm("addForm", editing);
    toggleForm("editForm", !editing);
}

window.addEventListener("load", () => {
    loadTodos();
});
```
A modest 111 lines of code, including whitespace between functions. That is 0.95% the amount of code compared to the React version. That means that in this application we control 100% of the functional code, while the React version we control less than 99% of the code running in production. Now I know this is a silly example, but I used it because a todo app is sort of like the "Hello, World!" of the SPA racket. I built the same app with Angular also, the result is double the size of React. It uses 370KB of code to achieve the same result.

So you may say that: Well, this really is a silly little example, and not what you build a SPA for...

I took that argument at face value, and started building this blog. I gave myself the same restrictions as this todo app. No external libraries that I wouldn't also use with React or Angular, like FontAwesome, Bootstrap 5 and I use two more libraries. I could ommit these, but I will give you my reasoning in the next post! 

Stay tuned!

_Written by The WorkingClassHacker_