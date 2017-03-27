package net.maidsafe.example.mail.model;

/**
 *
 * @author Krishna
 */
public class AppendableDataDataId {

    private String name;
    private boolean isPrivate;

    public AppendableDataDataId(String name, boolean isPrivate) {
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
