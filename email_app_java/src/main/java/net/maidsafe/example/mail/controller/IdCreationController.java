package net.maidsafe.example.mail.controller;

import net.maidsafe.example.mail.dao.IMessagingDao;
import net.maidsafe.example.mail.dao.LauncherAPI;
import net.maidsafe.example.mail.model.Result;
import net.maidsafe.example.mail.util.ServiceHandler;

/**
 *
 * @author Krishna
 */
public class IdCreationController {

    private final IMessagingDao dao;
    private ViewEvent viewEvent;

    
    public static interface ViewEvent {
        
        void created();

        void onError(String title, String message);
    }

    public IdCreationController(ViewEvent viewEvent) {
        dao = LauncherAPI.getInstance();
        this.viewEvent = viewEvent;
    }

    public void createId(String id) {
        new ServiceHandler<Boolean>(dao.createID(id)) {
            
            @Override
            public void onResult(Result<Boolean> result) {
                if (result.isSuccess()) {
                    viewEvent.created();
                } else {
                    viewEvent.onError("Id Creation Failed", result.getErrorMessage());
                }
            }
        }.start();
    }
}
