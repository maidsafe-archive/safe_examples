/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package net.maidsafe.example.mail.modal;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author Krishna
 */
public class AuthRequest {

    private final AppInfo app;
    private final List<String> permissions;        

    public AuthRequest(AppInfo app, List<String> permissions) {
        this.app = app;
        this.permissions = permissions;
    }

    public AppInfo getApp() {
        return app;
    }

    public List<String> getPermissions() {
        return permissions;
    }
}
