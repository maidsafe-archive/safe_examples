import { CONSTANTS } from '../constants';
import ACTION_TYPES from './actionTypes';
import { hashPublicId } from '../utils/app_utils';

var actionResolver;
var actionRejecter;
const actionPromise = new Promise((resolve, reject) => {
  actionResolver = resolve;
  actionRejecter = reject;
});

const createInbox = (app) => {
  let testemail = [
    {
      time: 1491341458652,
      from: "her",
      subject: "test",
      body: "test body",
    },
    {
      time: 1491341458752,
      from: "him",
      subject: "test2",
      body: "test body 2",
    }
  ];

  let base_inbox = {
    [CONSTANTS.MD_KEY_EMAIL_ENC_PUBLIC_KEY]: 'enc_pk', //FIXME: store public key for encrpytion
    email_1: JSON.stringify(testemail[0]),
    email_2: JSON.stringify(testemail[1])
  };
  console.log("BASE INBOX:", base_inbox);

  let inbox_md;
  let permSet;

  // FIXME: allow insert to others
  return app.mutableData.newRandomPublic(CONSTANTS.TAG_TYPE_INBOX)
    .then((md) => md.quickSetup(base_inbox))
    .then((md) => inbox_md = md)
    //FIXME: the code below depends on bug MAID-2047
/*    .then(() => app.mutableData.newPermissionSet())
    .then((pmSet) => permSet = pmSet)
    .then(() => permSet.setAllow('Insert'))
    .then(() => inbox_md.setUserPermissions(null, permSet, 1))
    .then(() => inbox_md);*/
}

const addEmailService = (app, services, serviceName, inbox_serialised) => {
  console.log("ADD EMAIL SERVICE")

  return app.mutableData.fromSerial(services)
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
      .then((md) => md.quickSetup({[serviceName]: inbox_serialised})
        .then((md) => md.serialise())
        .then((services_serial) => pub_names_md.getEntries()
          .then((entries) => entries.mutate())
          .then((mut) => mut.insert(publicId, services_serial)
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
    let app = getState().initializer.app;

    return createInbox(app)
        .then((md) => newAccount = {id: emailId, inbox_md: md})
        .then(() => newAccount.inbox_md.serialise())
        .then((md_serialised) => inbox_serialised = md_serialised)
        .then(() => app.auth.getAccessContainerInfo('_publicNames'))
        .then((pub_names_md) => pub_names_md.get(publicId)
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
