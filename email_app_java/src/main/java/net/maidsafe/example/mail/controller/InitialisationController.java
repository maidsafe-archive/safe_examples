/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package net.maidsafe.example.mail.controller;

import net.maidsafe.example.mail.dao.IMessagingDao;
import net.maidsafe.example.mail.dao.LauncherAPI;
import net.maidsafe.example.mail.modal.Result;
import net.maidsafe.example.mail.util.ServiceHandler;

/**
 *
 * @author Krishna
 */
public class InitialisationController {

    private final ViewEvent viewEvent;
    private final IMessagingDao dao = LauncherAPI.getInstance();

    public static interface ViewEvent {

        public void onAuthorised();

        public void onAppLoaded(String id);

        public void onError(String title, String message);
    }

    public InitialisationController(ViewEvent viewEvent) {
        this.viewEvent = viewEvent;
    }

    public void authorise() {        
        new ServiceHandler<Boolean>(dao.authorise()) {
            
            @Override
            public void onResult(Result<Boolean> result) {
                if (result.isSuccess()) {
                    viewEvent.onAuthorised();
                } else {
                    viewEvent.onError("Authorisation Failed", result.getErrorMessage());
                }
            }
        }.start();        
    }

    public void loadApplication() {
        new ServiceHandler<Boolean>(dao.loadAppConfig()) {
            
            @Override
            public void onResult(Result<Boolean> result) {                
                if (result.isSuccess()) {
                    viewEvent.onAppLoaded(dao.getId());
                } else {
                    viewEvent.onError("Initialisation Error", result.getErrorMessage());
                }
            }
        }.start();
    }

}
