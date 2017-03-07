package net.maidsafe.example.mail.modal;

/**
 *
 * @author Krishna
 */
public class StructuredDataDataId {

    private String name;
    private long tagType;

    public StructuredDataDataId(String name, long tagType) {
        this.name = name;
        this.tagType = tagType;
    }

    public String getName() {
        return name;
    }

    public long getTagType() {
        return tagType;
    }
        
}
