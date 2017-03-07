package net.maidsafe.example.mail.controller;

import java.util.List;
import net.maidsafe.example.mail.dao.IMessagingDao;
import net.maidsafe.example.mail.dao.LauncherAPI;
import net.maidsafe.example.mail.modal.Message;
import net.maidsafe.example.mail.modal.Result;
import net.maidsafe.example.mail.util.ServiceHandler;

/**
 *
 * @author Krishna
 */
public class AppController {

    private final IMessagingDao dao;

    public static interface ViewState {

        public void onInboxMessages(List<Message> messages);

        public void onInboxRefreshed(List<Message> messages);

        public void onSavedMessages(List<Message> messages);

        public void onMessageSent();

        public void onError(String title, String message);
    }

    private ViewState viewState;

    public AppController(ViewState viewState) {
        this.viewState = viewState;
        dao = LauncherAPI.getInstance();
    }

    public void loadSavedMessages() {
        new ServiceHandler<List<Message>>(dao.fetchSavedMessages()) {

            @Override
            public void onResult(Result<List<Message>> result) {
                if (!result.isSuccess()) {
                    viewState.onError("Failed To Load Saved Messages", result.getErrorMessage());
                    return;
                }
                viewState.onSavedMessages(result.getData());
            }
        }.start();
    }

    public void refreshInbox() {        
        new ServiceHandler<List<Message>>(dao.fetchInbox()) {

            @Override
            public void onResult(Result<List<Message>> result) {
                if (!result.isSuccess()) {
                    viewState.onError("Failed To Load Inbox", result.getErrorMessage());
                    return;
                }
                viewState.onInboxMessages(result.getData());
            }
        }.start();
    }

    public void sendMessage(Message message) {
        new ServiceHandler<Boolean>(dao.sendMessage(message)) {

            @Override
            public void onResult(Result<Boolean> result) {
                if (!result.isSuccess()) {
                    viewState.onError("Sending Failed", result.getErrorMessage());
                    return;
                }
                viewState.onMessageSent();
            }
        }.start();
    }

    public void deleteMessage(Message message, boolean fromInbox) {
        new ServiceHandler<Boolean>(dao.deleteMessage(message, fromInbox)) {

            @Override
            public void onResult(Result<Boolean> result) {
                if (!result.isSuccess()) {
                    viewState.onError("Failed To Delete Message", result.getErrorMessage());
                    return;
                }
                if (fromInbox) {
                    refreshInbox();
                } else {
                    loadSavedMessages();
                }                
            }
        }.start();
    }

    public void saveMessage(Message message) {
        new ServiceHandler<Boolean>(dao.saveMessage(message)) {

            @Override
            public void onResult(Result<Boolean> result) {
                if (!result.isSuccess()) {
                    viewState.onError("Failed To Save Message", result.getErrorMessage());
                    return;
                }
                refreshInbox();
            }
        }.start();
    }
    
    public List<Message> getInbox() {
        return dao.getInbox();
    }

    public List<Message> getSavedMessages() {
        return dao.getSavedMessages();
    }
}
