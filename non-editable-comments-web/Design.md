# Design of the plugin

## Requirement

To allow comments to be added by multiple users on a web page.

## Solution

Simple javascript plugin can be created which can be integrated with the web pages for easy integration.

## Approach

Public MutableData can be used to store the comments for a topic.
We create Public MutableData for each topic and insert the comments. The name of the mutable data is determined
in a deterministic manner by hashing the `window.location.hostname + topic`.

## Implementation

Refer [safe_api.js](./src/safe_api.js) for the implementation.

### Authorisation

The plugin requests for access to `_publicNames` container. The `_publicNames` container is requested for
displaying the Public IDs to the user to choose while posting the comment. Also the Public ID is used to
determine whether the current user is the admin (Ex, publicIdList.has(currentHostPublicID)).

### Initial setup

The plugin creates an unregistered client and tries to fetch the Public MutableData with defined type tag (15001).
If mutable data is not present, getEntries API call will fail. This is handled in the `isMDInitialised` function.

If MutableData is not initialised, the AuthRequest is sent to the authenticator (`setup` function). When approved, the public ID list is fetched
and validated for ownership (`isOwner` function). If current user is the owner of the hostname, the public MutableData is created in the network.
Note that the Public MutableData created is granted permission for Insert for Anyone. This will allow any authorised user to add the comment.

If the MutableData was already setup, authorise as normal user and prepare the mutable data handle (`createMutableDataHandle` function).

### Posting comment

Comment is inserted in the mutable data using the [insert API](http://docs.maidsafe.net/beaker-plugin-safe-app/#windowsafemutabledataentriesinsert) is used.
Every CommentModel has a uninque id and the ID is used as key and the CommentModel is saved as a JSON String as value.

### Deleting comment

Only admin/owner of the MutableData can delete the comments. When the admin authorises the `delete` option for the comments should be visible.
