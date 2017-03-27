package net.maidsafe.example.mail.model;

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
