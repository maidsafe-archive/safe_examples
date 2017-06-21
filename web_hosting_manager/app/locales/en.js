const en = {
  label: {
    waitingForAuth: {
      title: 'Waiting For Authorisation',
      line1: 'Authorisation request sent.',
      'line2-1': 'Application needs manage access, to',
      'line2-2': 'containers. Approve the request from authenticator to continue.',
      'line3-1': 'The public id and services must be added to the',
      'line3-2': 'container for allowing other applications to collaborate.',
      line4: 'Authorisation information will be stored on local keychain. The local data can be manually cleared from the menu option.',
      'line5-1': 'File',
      'line5-2': 'Clear Access Data'
    },
    initialising: {
      title: 'Initialising Application',
      connecting: 'Connecting to SAFE Network',
      accessContainer: 'Fetching Access Container',
      publicNamesContainer: 'Fetching Public Names Container',
      publicContainers: 'Fetching _public Container',
      preparingApp: 'Preparing Application',
      connectionErrorTitle: 'Failed To Connect',
      authErrorTitle: 'Application Initialisation Failed',
      revoked: 'Application Revoked'
    },
    networkStatus: {
      connecting: 'connecting',
      connected: 'connected'
    },
    createPublicId: 'Create Public Id',
    noPublicIdText: 'No Public Id found. Create one to begin.',
    createService: 'Create Service',
    createNewContainer: 'Create a new public container',
    or: 'Or',
    selectContainer: 'Select a container to be mapped',
    creating: 'Creating',
    create: 'Create',
    manageFiles: 'Manage Files',
    remap: 'Remap',
    delete: 'Delete',
    home: 'Home',
    remapTitle: 'Remap %{service}.%{publicId}',
    ok: 'Ok',
    close: 'Close',
    cancel: 'Cancel',
    selectFile: 'Select File',
    selectDirectory: 'Select Directory',
    uploadDirectory: 'Upload Directory',
    uploadFile: 'Upload File',
    uploadingMessage: 'Uploading files',
    downloadingMessage: 'Downloading',
    loading: 'Loading...',
    empty: 'Empty'
  },
  messages: {
    emptyServiceName: 'Service name must be filled',
    emptyContainerName: 'Container name must be filled',
    serviceNameInvalid: 'Service name must container only alphanumeric characters or - and should not exceed 62 characters',
    publicNameInvalid: 'Public name must container only alphanumeric characters or - and should not exceed 62 characters',
    serviceNamePlaceholder: 'Enter Service Name',
    containerNamePlaceholder: 'Container Name. Eg, <service-name>-root',
    noContainerPlaceHolder: 'No Public Container Available',
    publicIdPlaceHolder: 'Enter Public Id',
    notImplemented: 'Not implemented',
    cannotBeEmpty: '%{name} can not be empty',
    restrictedFileSize: 'File larger than %{size} Mb can not be uploaded',
    authReqError: 'Failed to send authorisation request',
    authorisationFailed: 'Authorisation failed!',
    fetchingAccessFailed: 'Fetching Access Info Failed: %{error}',
    fetchingPublicContainerFailed: 'Fetching Public Containers Failed: %{error}',
    fetchingContainerFailed: 'Fetching Container Failed: %{error}',
    fetchingPublicNamesFailed: 'Fetching Public Names Failed: %{error}',
    fetchingServicesFailed: 'Fetching Services Failed: %{error}',
    safeNetworkDisconnected: 'Could not connect to SAFE Network',
    downloadCancelled: 'Download cancelled',
    uploadCancelled: 'Upload cancelled'
  }
};

export default en;
