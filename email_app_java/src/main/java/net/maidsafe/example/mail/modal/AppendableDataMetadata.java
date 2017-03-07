package net.maidsafe.example.mail.modal;

/**
 *
 * @author Krishna
 */
public class AppendableDataMetadata {

    private boolean isOwner;
    private long version;
    private String filterType;
    private long filterLength;
    private long dataLength;
    private long deletedDataLength;
    private long handleId;
    
    public boolean isIsOwner() {
        return isOwner;
    }

    public void setIsOwner(boolean isOwner) {
        this.isOwner = isOwner;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public String getFilterType() {
        return filterType;
    }

    public void setFilterType(String filterType) {
        this.filterType = filterType;
    }

    public long getFilterLength() {
        return filterLength;
    }

    public void setFilterLength(long filterLength) {
        this.filterLength = filterLength;
    }

    public long getDataLength() {
        return dataLength;
    }

    public void setDataLength(long dataLength) {
        this.dataLength = dataLength;
    }

    public long getDeletedDataLength() {
        return deletedDataLength;
    }

    public void setDeletedDataLength(long deletedDataLength) {
        this.deletedDataLength = deletedDataLength;
    }

    public long getHandleId() {
        return handleId;
    }

    public void setHandleId(long handleId) {
        this.handleId = handleId;
    }       
}
