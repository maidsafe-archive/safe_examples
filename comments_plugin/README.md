The plugin works on safe_browser. This provides ability to add comments to any html page.

## Usage instructions:

### Include the library

Add following libraries to your html page:
  * [Bootstrap](http://getbootstrap.com/)
  * [Jquery](https://jquery.com/)

Add the stylesheet to your html page:
    
    <link href="./comments-tutorial.css" rel="stylesheet">

Add the script to your html page:
    
    <script type="application/javascript" src="./comments-tutorial.js"/>

### Initialise

The library must be initialised by invoking the `new window.Comment();` function.

The library will add comments UI to the `#comments` `div` element or the UI can be added to
a specific DOM element by passing it's selector to the `init` method.

Example, `new window.Comment('#myDiv')`


## Enabling Comments for page

The admin must enable the comments on a page by visiting the page and clicking on the `Enable Comments` Button.

This step is need at this time to make sure the admin becomes the owner of the `AppendableData` used to hold the comments.


# Limitations
 - Can not unblock blocked users
 - Can not edit comments
 - AppendableData has a size limitation of 100Kb. Comments can not be added if the size of the appendable data has reached the max
