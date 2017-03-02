/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package net.maidsafe.example.mail.modal;

/**
 *
 * @author Krishna
 */
public class StructuredDataMetadata {
    private boolean isOwner;
    private long version;    
    private long handleId;
    private long dataVersionLength;

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

    public long getHandleId() {
        return handleId;
    }

    public void setHandleId(long handleId) {
        this.handleId = handleId;
    }

    public long getDataVersionLength() {
        return dataVersionLength;
    }

    public void setDataVersionLength(long dataVersionLength) {
        this.dataVersionLength = dataVersionLength;
    }
    
    
}
