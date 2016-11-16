# MaidSafe Demo App Change Log

##[0.6.2]
- Can remap service if service home directory got corrupted

##[0.6.1]
- Reverse DNS specifier updated in package.json
- Updated service links on UI to `safe://` scheme

##[0.6.0]
- Compatibility with launcher 0.8.0
- Rename files and folders
- Cut/Copy files and folders
- Packaging fixes
- Minor style fixes

##[0.5.1]
- Close application on authorisation failure

##[0.5.0]
- New UI workflow integration
  - Separation of website and network data management
- Ability to cancel uploads
- Show file count status while uploading folders
- Open the download folder instead of opening the downloaded file
- Initial root folder creation failure recovery
- Show initial authorisation stages on loading
- Ability to remap service home directory
- Option to delete a service
- various bug fixes and UX updates

##[0.4.0]
  - File size limit increased to 50 MB
  - Compatibility with safe launcher v0.6.0

##[0.3.1]
  - Error handling for file upload streaming
  - validation for service and public names

##[0.3.0]
  - Safe launcher v0.5 compatibility

##[0.2.2]
  - Fixed the alert dialog (PR #58).

##[0.2.1]
  - Folder upload bug fix for OSX and Linux  
  - Overwrite of directory error is handled and presented to the user
  - UI Text updates to indicate folder requirement while creating a service

##[0.2.0]
  - File upload logic refactored
  - Progress bar issues resolved
  - OSX file picker issue fix
  - File corrupted while downloading issue fix
  - Empty file upload issue fixed
  - Duplicate public Id creation resolved
  - Minor UI fixes
  - File size restriction updated to 5 Mb
  - SAFE Launcher 0.4.0
