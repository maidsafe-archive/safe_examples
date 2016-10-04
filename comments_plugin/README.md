# Comments Plugin Tutorial

The plugin works on safe_browser. This provides ability to add comments to any html page.

## Usage instructions:

### Dependencies

The plugin depends on **bootstrap v3.3.7** for UI and also **jquery v3.1.1.**
The dependencies are included in this repository itself.


### Getting Started

#### Include dependencies
   `<link href="./bootstrap-v3.3.7.min.css" rel="stylesheet">`
    `<script type="application/javascript" src="./jquery-3.1.1.min.js"/>`

#### Include tutorial plugin
Add the stylesheet to your html page:
    `<link href="./comments-tutorial.css" rel="stylesheet">`

Add the script to your html page:
    `<script type="application/javascript" src="./comments-tutorial.js"/>`

### Initialise

The library must be initialised by invoking the `commentsTutorial.loadComments();` function.

The library will add comments UI to the `#comments` `div` element or the UI can be added to
a specific DOM element by passing it's selector to the `init` method.

Example, `commentsTutorial.loadComments('#myDiv')`


## Enabling Comments for page

The admin must enable the comments on a page by visiting the page and clicking on the `Enable Comments` Button.

This step is need at this time to make sure the admin becomes the owner of the `AppendableData` used to hold the comments.

## Example

An sample usage is demonstrated in the [example](./example) folder.

A simple static page with comments integrated is demonstrated.

# Limitations
 - Can not edit comments
 - AppendableData has a size limitation of 100Kb. Comments can not be added if the size of the appendable data has reached the max
