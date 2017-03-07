package net.maidsafe.example.mail.model;

import java.util.List;

/**
 *
 * @author Krishna
 */
public class AuthResponse {
 
    private String token;
    private List<String> permissions;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
    }
            
}
