package net.maidsafe.example.mail.modal;

/**
 *
 * @author Krishna
 */
public class FileResponse {
    private final String mimeType;
    private final String metadata;    
    private final byte[] content;

    public FileResponse(String mimeType, String metadata, byte[] content) {
        this.mimeType = mimeType;
        this.metadata = metadata;
        this.content = content;
    }        

    public String getMimeType() {
        return mimeType;
    }
    
    public String getMetadata() {
        return metadata;
    }

    public byte[] getContent() {
        return content;
    }
    
}
