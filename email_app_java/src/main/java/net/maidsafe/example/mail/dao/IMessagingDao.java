package net.maidsafe.example.mail.dao;

import java.util.List;
import java.util.concurrent.Future;
import net.maidsafe.example.mail.modal.Message;
import net.maidsafe.example.mail.modal.Result;

/**
 *
 * @author Krishna
 */
public interface IMessagingDao {

    public Future<Result<Boolean>> authorise();

    public Future<Result<Boolean>> loadAppConfig();

    public boolean hasId();

    public String getId();

    public List<Message> getInbox();

    public List<Message> getSavedMessages();

    public Future<Result<Boolean>> createID(String id);   

    public Future<Result<List<Message>>> fetchInbox();

    public Future<Result<List<Message>>> fetchSavedMessages();

    public Future<Result<Boolean>> sendMessage(Message message);

    public Future<Result<Boolean>> saveMessage(Message message);

    public Future<Result<Boolean>> deleteMessage(Message message, boolean fromInbox);

}
