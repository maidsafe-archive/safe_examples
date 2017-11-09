# Comments Plugin (Editable)

Simple javascript plugin built using React and Mobx for enabling disqus like commenting feature where comments can be editable.

## Build the Plugin

1. Clone the project
    ```bash
    $ git clone https://github.com/maidsafe/safe_examples
    $ cd safe_examples/editable-comments-web
    ```

2. Install the Node.js dependencies.
    ```bash
    $ yarn install
    ```

3. `yarn build` will build the plugin to the `build` folder.


## Integrating the plugin to your page

Two simple steps for integrating the plugin:

- Include the script in your html and initialise the plugin
- Visit the page to enable comments for that page.

### Initialising the plugin
Build and refer the `comments.js` file in your html page.

Initialise the plugin after the DOM is ready by passing a `topic` and `targetId` as parameters.
`window.safeComments('unique-topic', 'div-comments');`

The above line of code will load the comments UI in target specified as `div-comments`. The comments added to this 
page will be saved against the topic `unique-topic` in a MutableData. The name of the MutableData is 
determisinstically generated (hash(window.localtion.hostname)). The `target` is an optional value and it defaults to `#comments`.

Every page must be supplied with a unique topic. The topic should unique under the hosting, 
since all the topics are added as keys in the MutableData. If a duplicate topic is passsed the 
comments related to that key if already present will be modified

Example snippet:

```HTML
<html>
	<head>
		<script src="./comment.js"></script>
		<script>
		document.addEventListener("DOMContentLoaded", function(event) {
			window.safeComments('Page-Topic-My-Blog', 'CommentTarget');
		});
		</script>
	</head>
	<div>
		<div>
			<h1>My Blog</h1>
			<div>Blog content goes here!</div>
		</div>
		<div id="CommentTarget"></div>
	</div>
</html>
```

After publishing the page, admin must visit the page to enable comments for the page.
