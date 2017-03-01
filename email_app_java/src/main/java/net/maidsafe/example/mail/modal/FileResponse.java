/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package net.maidsafe.example.mail.modal;

import java.util.List;

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
