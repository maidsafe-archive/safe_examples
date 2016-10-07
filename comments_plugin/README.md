# Comments Plugin Tutorial

The plugin works on safe_browser. This provides ability to add comments to any html page.

## Usage instructions:

### Getting Started

Copy the `comments`-folder script into your website.

Add the script to your html page :
```HTML
<script>
window.__COMMENTS_ID = "#comments"
</script>
<script type="application/javascript" id="comments-loader" src="./comments/main.js"/>
```

### Initialise

If you specify the `__COMMENTS_ID` as shown the library will automatically initialize at startup and add the comments UI to the specified element. You can specify any id there. Omitting that reference, comments won't be loaded directly but need to be invoked directly via:

```
<script>
  window.safeComments.init('#myCommentsId');
</script>
```


## Enabling Comments for page

The admin must enable the comments on a page by visiting the page and clicking on the `Enable Comments` Button.

This step is need at this time to make sure the admin becomes the owner of the `AppendableData` used to hold the comments.

## Example

An sample usage is demonstrated in the [example](./example) folder.

A simple static page with comments integrated is demonstrated.

# Limitations
 - Can not edit comments
 - AppendableData has a size limitation of 100Kb. Comments can not be added if the size of the appendable data has reached the max

## Inline Documentation

Is rendered using (docco](https://jashkenas.github.io/docco/) and can be found in the [docs/](./docs/app.html] folder. To refresh the documentation to the latest inline comments run:

```bash
docco comments/src/*
```
