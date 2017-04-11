package net.maidsafe.example.mail.model;

/**
 *
 * @author Krishna
 */
public class AppendableDataCreateRequest {

    private final String name;
    private final boolean isPrivate;
    
    public AppendableDataCreateRequest(String name, boolean isPrivate) {
        this.name = name;
        this.isPrivate = isPrivate;
    }

    public String getName() {
        return name;
    }

    public boolean isIsPrivate() {
        return isPrivate;
    }       
    
}
