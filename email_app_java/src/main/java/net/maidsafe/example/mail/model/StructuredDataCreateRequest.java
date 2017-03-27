package net.maidsafe.example.mail.model;

/**
 *
 * @author Krishna
 */
public class StructuredDataCreateRequest {
    private String name;
    private long typeTag;
    private long cipherOpts;
    private String data;

    public StructuredDataCreateRequest() {
    }

    public StructuredDataCreateRequest(String name, long typeTag, long cipherOpts, String data) {
        this.name = name;
        this.typeTag = typeTag;
        this.cipherOpts = cipherOpts;
        this.data = data;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getTypeTag() {
        return typeTag;
    }

    public void setTypeTag(long typeTag) {
        this.typeTag = typeTag;
    }

    public long getCipherOpts() {
        return cipherOpts;
    }

    public void setCipherOpts(long cipherOpts) {
        this.cipherOpts = cipherOpts;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }        
    
}
