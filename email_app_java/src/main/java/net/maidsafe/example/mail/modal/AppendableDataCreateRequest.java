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
