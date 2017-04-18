import { CONSTANTS } from '../constants';
import ACTION_TYPES from './actionTypes';
import { hashPublicId } from '../utils/app_utils';

var actionResolver;
var actionRejecter;
const actionPromise = new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

const createInbox = (app, enc_pk) => {
  let base_inbox = {
    [CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY]: enc_pk
  };
  let inbox_md;
  let permSet;

  return app.mutableData.newRandomPublic(CONSTANTS.TAG_TYPE_INBOX)
    .then((md) => md.quickSetup(base_inbox))
    .then((md) => inbox_md = md)
    .then(() => app.mutableData.newPermissionSet())
    .then((pmSet) => permSet = pmSet)
    .then(() => permSet.setAllow('Insert'))
    .then(() => permSet.setAllow('Delete')) //FIXME: this shouldn't be needed
    .then(() => inbox_md.setUserPermissions(null, permSet, 1))
    .then(() => inbox_md);
}

const createArchive = (app) => {
  let inbox_md;
  let permSet;
  return app.mutableData.newRandomPrivate(CONSTANTS.TAG_TYPE_EMAIL_ARCHIVE)
    .then((md) => md.quickSetup())
    .then((md) => inbox_md = md)
    .then(() => app.mutableData.newPermissionSet())
    .then((pmSet) => permSet = pmSet)
    .then(() => permSet.setAllow('Insert')) //FIXME: this shouldn't be needed
    .then(() => inbox_md.setUserPermissions(null, permSet, 1))
    .then(() => inbox_md);
}

const addEmailService = (app, services, serviceName, inbox_serialised) => {
  console.log("ADD EMAIL SERVICE")

  return app.mutableData.newPublic(services, CONSTANTS.TAG_TYPE_DNS)
    .then((services_md) => services_md.getEntries()
      .then((entries) => entries.mutate())
      .then((mut) => mut.insert(serviceName, inbox_serialised)
        .then(() => services_md.applyEntriesMutation(mut))
      ))
      .catch(actionRejecter);
}

const createPublicIdAndEmailService = (app, pub_names_md, address, publicId,
                                        serviceName, inbox_serialised) => {
  console.log("CREATE PUBLIC ID AND EMAIL SERVICE")

  return app.mutableData.newPublic(address, CONSTANTS.TAG_TYPE_DNS)
      .then((md) => md.quickSetup({ [serviceName]: inbox_serialised })
        .then((md) => md.getNameAndTag())
        .then((services) => pub_names_md.getEntries()
          .then((entries) => entries.mutate())
          .then((mut) => mut.insert(publicId, services.name)
            .then(() => pub_names_md.applyEntriesMutation(mut))
          ))
      )
      .catch(actionRejecter);
}

export const createAccount = (emailId) => {
  return function (dispatch, getState) {
    dispatch({
      type: ACTION_TYPES.CREATE_ACCOUNT,
      payload: actionPromise
    });

    // It supports complex email IDs, e.g. 'emailA.myshop', 'emailB.myshop'
    let emailIdParts = emailId.split('.');
    const publicId = emailIdParts.pop();
    const serviceName = emailIdParts.join('.') + CONSTANTS.SERVICE_NAME_POSTFIX;
    const address = hashPublicId(publicId);

    let newAccount = {};
    let inbox_serialised;
    let inbox;
    let app = getState().initializer.app;
    let enc_pk = 'enc_pk'; //FIXME: store public key for encrpytion here

    return createInbox(app, enc_pk)
        .then((md) => inbox = md)
        .then(() => createArchive(app))
        .then((md) => newAccount = {id: emailId, inbox_md: inbox, archive_md: md})
        .then(() => newAccount.inbox_md.serialise())
        .then((md_serialised) => inbox_serialised = md_serialised)
        .then(() => app.auth.refreshContainerAccess())
        .then(() => app.auth.getAccessContainerInfo('_publicNames'))
        .then((pub_names_md) => pub_names_md.encryptKey(publicId)
          .then((encrypted_publicId) => pub_names_md.get(encrypted_publicId))
          .then((services) => {
              // FIXME: for some reason I'm not able to read the _publicNames entries
              console.log("PUBLIC ID EXISTS", services)
              return addService(app, services, serviceName, inbox_serialised);
            }, (err) => {
              console.log("ERROR IN PUBLIC NAMES:", err)
              if (err.name === 'ERR_NO_SUCH_ENTRY') {
                return createPublicIdAndEmailService(app, pub_names_md, address,
                                        publicId, serviceName, inbox_serialised);
              }
              return actionRejecter(err);
            })
        )
        .then(() => actionResolver(newAccount))
        .catch(actionRejecter);
  };
};

export const createAccountError = (error) => ({
  type: ACTION_TYPES.CREATE_ACCOUNT_ERROR,
  error
});
