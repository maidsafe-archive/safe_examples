package net.maidsafe.example.mail.model;

/**
 *
 * @author Krishna
 */
public class AppInfo { 
    private final String id;
    private final String name;
    private final String vendor;
    private final String version;
    
    public AppInfo(String id, String name, String description, String version) {
        this.id = id;
        this.name = name;
        this.vendor = description;
        this.version = version;        
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getVendor() {
        return vendor;
    }

    public String getVersion() {
        return version;
    }
    
    
}
