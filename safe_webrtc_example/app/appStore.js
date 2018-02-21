import { observable, transaction, isObservable, extendObservable, action, autorun, ObservableMap } from 'mobx';
import 'babel-polyfill';

import CONST from './constants';
import SafeApi from './safe_comm';

export default class AppStore {
  @observable error = '';
  @observable loading = false;
  @observable loaded = false;
  @observable loaderDesc = CONST.UI.DEFAULT_LOADING_DESC;
  @observable publicNames = [];
  @observable invites = [];
  @observable newInvites = 0;
  @observable selectedPubName = '';
  @observable connectionState = CONST.CONN_STATE.INIT;
  @observable isNwConnected = true;
  @observable isNwConnecting = false;

  @observable uid = null;
  @observable initiater = null;
  @observable persona = null;
  @observable state = null;
  @observable offer = null;
  @observable answer = null;
  @observable offerCandidates = [];
  @observable answerCandidates = [];
  @observable remoteOffer = null;
  @observable remoteAnswer = null;
  @observable remoteOfferCandidates = [];
  @observable remoteAnswerCandidates = [];

  constructor() {
    this.api = null;
    this.isAuthorised = false;
  }

  createUid() {
    return new Date().getTime();
  }

  transformConnInfo() {
    const isCaller = (this.persona === CONST.USER_POSITION.CALLER);
    const res = {
      state: this.state,
      uid: this.uid
    };
    const obj = {};
    obj['persona'] = this.persona;
    obj['initiater'] = this.initiater;
    obj['caller'] = {};
    obj['callee'] = {};
    obj.caller['offer'] = isCaller ? this.offer : this.remoteOffer;
    obj.caller['offerCandidates'] = isCaller ? this.offerCandidates : this.remoteOfferCandidates;
    obj.caller['answer'] = isCaller ? this.answer : this.remoteAnswer;
    obj.caller['answerCandidates'] = isCaller ? this.answerCandidates : this.remoteAnswerCandidates;
    obj.callee['offer'] = isCaller ? this.remoteOffer : this.offer;
    obj.callee['offerCandidates'] = isCaller ? this.remoteOfferCandidates : this.offerCandidates;
    obj.callee['answer'] = isCaller ? this.remoteAnswer : this.answer;
    obj.callee['answerCandidates'] = isCaller ? this.remoteAnswerCandidates : this.answerCandidates;

    res.data = obj;
    return res;
  }

  parseConnStr(connStr) {
    const obj = {};
    const parsedObj = JSON.parse(connStr);
    obj['state'] = parsedObj.state;
    obj['uid'] = parsedObj.uid;

    const data = parsedObj.data;
    obj['initiater'] = data.initiater;
    obj['caller'] = {};
    obj['callee'] = {};
    obj.caller['offer'] = data.caller.offer;
    obj.caller['offerCandidates'] = data.caller.offerCandidates;
    obj.caller['answer'] = data.caller.answer;
    obj.caller['answerCandidates'] = data.caller.answerCandidates;
    obj.callee['offer'] = data.callee.offer;
    obj.callee['offerCandidates'] = data.callee.offerCandidates;
    obj.callee['answer'] = data.callee.answer;
    obj.callee['answerCandidates'] = data.callee.answerCandidates;
    return obj;
  }

  @action
  resetConnInfo() {
    this.connectionState = CONST.CONN_STATE.INIT;
    this.uid = null;
    this.initiater = null;
    this.persona = null;
    this.state = null;
    this.offer = null;
    this.answer = null;
    this.offerCandidates = [];
    this.answerCandidates = [];
    this.remoteOffer = null;
    this.remoteAnswer = null;
    this.remoteOfferCandidates = [];
    this.remoteAnswerCandidates = [];
  }

  @action
  setLoader(state, desc, isloaded) {
    this.loaded = !!isloaded;
    this.loading = state;
    this.loaderDesc = desc || CONST.UI.DEFAULT_LOADING_DESC;
  }

  @action
  createConn(initiater, persona, uid) {
    this.initiater = initiater;
    this.uid = uid;
    this.persona = persona;
  }

  @action
  setInitiater(initiater) {
    this.initiater = initiater;
  }

  @action
  setConnState(state) {
    this.connectionState = state;
    this.state = state;
  }

  @action
  setRemoteOffer(offer) {
    this.remoteOffer = offer;
  }

  @action
  setRemoteOfferCandidates(candidates) {
    this.remoteOfferCandidates = candidates;
  }

  @action
  setRemoteAnswer(answer) {
    this.remoteAnswer = answer;
  }

  @action
  setRemoteAnswerCandidates(candidates) {
    this.remoteAnswerCandidates = candidates;
  }

  @action
  checkInviteAccepted() {
    return new Promise(async (resolve, reject) => {
      try {
        const connInfo = this.transformConnInfo();
        const connStr = await this.api.fetchConnInfo(connInfo);
        const parsedConnInfo = this.parseConnStr(connStr);
        if (parsedConnInfo.state === CONST.CONN_STATE.INVITE_ACCEPTED) {
          this.setRemoteOffer(parsedConnInfo.callee.offer);
          this.setRemoteOfferCandidates(parsedConnInfo.callee.offerCandidates);
          this.setRemoteAnswer(parsedConnInfo.callee.answer);
          this.setRemoteAnswerCandidates(parsedConnInfo.callee.answerCandidates);
          const connInfo1 = this.transformConnInfo();
          return resolve(true);
        }
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  }

  @action
  checkCallAccepted() {
    return new Promise(async (resolve, reject) => {
      try {
        const connInfo = this.transformConnInfo();
        const connStr = await this.api.fetchConnInfo(connInfo);
        const parsedConnInfo = this.parseConnStr(connStr);
        if (parsedConnInfo.state === CONST.CONN_STATE.CONNECTED) {
          this.connectionState = CONST.CONN_STATE.CONNECTED;
          return resolve(true);
        }
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  }

  @action
  checkForCalling() {
    return new Promise(async (resolve, reject) => {
      try {
        const connInfo = this.transformConnInfo();
        const connStr = await this.api.fetchConnInfo(connInfo, CONST.CONN_STATE.CALLING);
        const parsedConnInfo = this.parseConnStr(connStr);
        if (parsedConnInfo.state === CONST.CONN_STATE.CALLING) {
          this.setRemoteAnswer(parsedConnInfo.caller.answer);
          this.setRemoteAnswerCandidates(parsedConnInfo.caller.answerCandidates);
          return resolve(true);
        }
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  }

  @action
  setUid(uid) {
    this.uid = uid;
  }

  @action
  nwStateCb(newState) {
    if (newState === CONST.NET_STATE.CONNECTED) {
      this.isNwConnected = true;
      return;
    }
    this.isNwConnected = false;
  }

  @action
  setOffer(offer) {
    this.offer = offer;
  }

  @action
  setAnswer(answer) {
    this.answer = answer;
  }

  @action
  setOfferCandidates(candidates) {
    this.offerCandidates = candidates;
  }

  @action
  setAnswerCandidates(candidates) {
    this.answerCandidates = candidates;
  }

  @action
  authorisation() {
    return new Promise(async (resolve, reject) => {
      try {
        this.setLoader(true, 'Authorising application');
        this.api = new SafeApi(this.nwStateCb);
        await this.api.authorise();
        this.isAuthorised = true;
        this.setLoader(false);
        resolve(true);
      } catch (err) {
        console.error(`Authorisation error :: ${err}`);
      }
    });
  }

  @action
  fetchPublicNames() {
    return new Promise(async (resolve, reject) => {
      try {
        this.setLoader(true, 'Fetching public names');
        this.publicNames = await this.api.getPublicNames();
        if (this.publicNames.length !== 0 && !this.selectedPubName) {
          this.setLoader(true, 'Initializing');
          this.selectedPubName = this.publicNames[0];
          await this.api.setupPublicName(this.selectedPubName);
        }
        this.setLoader(false);
      } catch (err) {
        console.error(`Fetch publicNames error :: ${err}`);
      }
    });
  }

  @action
  fetchInvites(isPolling) {
    return new Promise(async (resolve, reject) => {
      try {

        if (isPolling && !this.isAuthorised) {
          return resolve(true);
        }

        if (!isPolling) {
          this.setLoader(true, 'Fetching invites');
        }
        const oldCount = this.invites.length;
        this.invites = await this.api.fetchInvites();
        const diff = this.invites.length - oldCount;
        if (diff >= 1) {
          this.newInvites += diff;
        }
        this.setLoader(false);
        resolve(true);
      } catch (err) {
        console.error('Fetch invites :: ', err);
        reject(err);
      }
    });
  }

  @action
  activatePubName(pubName) {
    if (!pubName || !this.publicNames.includes(pubName)) {
      return;
    }
    return new Promise(async (resolve, reject) => {
      this.setLoader(true, `Activating selected ${pubName}`);
      this.selectedPubName = pubName;
      await this.api.setupPublicName(this.selectedPubName);
      // reset invite count
      this.newInvites = 0;
      this.setLoader(false, null, true);
    });
  }

  @action
  reset() {
    this.loaded = false;
    this.error = '';
    this.setLoader(false);
  }

  @action
  initialiseConnInfo(friendID, friendUID) {
    return new Promise(async(resolve, reject) => {
      try {
        if (friendID) {
          await this.api.connect(friendID);
        }
        const isCallee = !!friendID;
        const userPosition = isCallee ? CONST.USER_POSITION.CALLEE : CONST.USER_POSITION.CALLER;
        const uid = friendUID || this.createUid();
        this.createConn(this.selectedPubName, userPosition, uid);
        if (isCallee) {
          this.setInitiater(friendID);
          const connInfo = this.transformConnInfo();
          const connInfoStr = await this.api.fetchConnInfo(connInfo);
          const parsedJson = this.parseConnStr(connInfoStr);
          this.setUid(parsedJson.uid);
          this.setRemoteOffer(parsedJson.caller.offer);
          this.setRemoteOfferCandidates(parsedJson.caller.offerCandidates);
        }
        resolve(true);
      } catch (err) {
        console.error('Initialise connInfo error :: ', err);
      }
    });
  }

  // connInfo with caller offer and offer candidates
  @action
  sendInvite() {
    return new Promise(async (resolve, reject) => {
      try {
        this.setConnState(CONST.CONN_STATE.SEND_INVITE);
        const connInfo = this.transformConnInfo();
        await this.api.sendInvite(connInfo);
        resolve(true);
      } catch (err) {
        console.error('Send invite error :: ', err);
      }
    });
  }

  // connInfo with caller offer and offer candidates
  // and callee offer and offer candidates with answer and answer candidates
  @action
  acceptInvite() {
    return new Promise(async (resolve, reject) => {
      try {
        this.setConnState(CONST.CONN_STATE.INVITE_ACCEPTED);
        const connInfo = this.transformConnInfo();
        await this.api.acceptInvite(connInfo);
        resolve(true);
      } catch (err) {
        console.error('Accept invite error :: ', err);
      }
    });
  }

  // connInfo with callee answer and candidates
  @action
  calling() {
    return new Promise(async (resolve) => {
      try {
        this.setConnState(CONST.CONN_STATE.CALLING);
        const connInfo = this.transformConnInfo();
        await this.api.calling(connInfo);
        resolve(true);
      } catch (err) {
        console.error('Calling error :: ', err);
      }
    });
  }

  @action
  connect(friendID) {
    return new Promise(async (resolve, reject) => {
      try {
        this.setLoader(true, `Connecting to ${friendID}`);
        await this.api.connect(friendID);
        this.setLoader(false, null, true);
        resolve(true);
      } catch (err) {
        this.error = new Error('Make sure the Callee has initialised with WebRTC app');
        console.log('Connect error :: ', err);
      }
    });
  }

  @action
  connected() {
    return new Promise(async (resolve) => {
      try {
        this.setConnState(CONST.CONN_STATE.CONNECTED);
        const connInfo = this.transformConnInfo();
        await this.api.connected(connInfo);
        resolve(true);
      } catch (err) {
        console.log('Connected error :: ', err);
      }
    });
  }

  @action
  resetFetchCount() {
    this.newInvites = 0;
  }

  @action
  deleteInvite() {
    return new Promise(async (resolve, reject) => {
      try {
        const connInfo = this.transformConnInfo();
        await this.api.deleteInvite(connInfo);
        return resolve(true);
      } catch (err) {
        console.log('Connected error :: ', err);
        reject(err);
      }
    });
  }
}
