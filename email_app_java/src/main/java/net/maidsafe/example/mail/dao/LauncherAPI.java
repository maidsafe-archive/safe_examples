/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package net.maidsafe.example.mail.dao;

import com.google.gson.Gson;
import java.io.IOException;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import net.maidsafe.example.mail.modal.AppConfig;
import net.maidsafe.example.mail.modal.AppInfo;
import net.maidsafe.example.mail.modal.AppendableDataCreateRequest;
import net.maidsafe.example.mail.modal.AppendableDataDataId;
import net.maidsafe.example.mail.modal.AppendableDataMetadata;
import net.maidsafe.example.mail.modal.AuthRequest;
import net.maidsafe.example.mail.modal.AuthResponse;
import net.maidsafe.example.mail.modal.FileResponse;
import net.maidsafe.example.mail.modal.HandleIdResponse;
import net.maidsafe.example.mail.modal.Message;
import net.maidsafe.example.mail.modal.Result;
import net.maidsafe.example.mail.modal.StructuredDataCreateRequest;
import net.maidsafe.example.mail.modal.StructuredDataDataId;
import net.maidsafe.example.mail.modal.StructuredDataUpdateRequest;
import okhttp3.Headers;

import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import okio.ByteString;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.jackson.JacksonConverterFactory;

/**
 *
 * @author Krishna
 */
public class LauncherAPI implements IMessagingDao, Cloneable {

    private final ExecutorService executor;
    private static LauncherAPI instance;
    private List<Message> inboxMessages;
    private List<Message> savedMessages;
    private String authToken;
    private AppConfig appConfig;
    private final long UNVERSIONED_SD_TAG = 500;
    private final String END_POINT = "http://localhost:8100/";
    private IRestAPI api;

    // Hanldes
    private Long symmetricCipherOptsHandle;
    private long structuredDataHandle;
    private List<String> savedMessagesDataIdList;

    private LauncherAPI() {
        Retrofit retrofit;
        executor = Executors.newFixedThreadPool(5);
        inboxMessages = new ArrayList<>();
        savedMessages = new ArrayList<>();
        savedMessagesDataIdList = new ArrayList<>();
        HttpUrl url = HttpUrl.parse(END_POINT);
        retrofit = new Retrofit.Builder().baseUrl(url)
                .addConverterFactory(JacksonConverterFactory.create())
                .build();
        api = retrofit.create(IRestAPI.class);
    }

    public static synchronized LauncherAPI getInstance() {
        if (instance == null) {
            instance = new LauncherAPI();
        }
        return instance;
    }

    /**
     * Send authorisation request to SAFE Launcher On Success the auth token is
     * obtained
     */
    @Override
    public Future<Result<Boolean>> authorise() {
        return executor.submit(() -> {
            AppInfo app = new AppInfo("com.krishna.demo", "Messaging App", "MaidSafe", "0.1.0");
            List<String> permissions = Arrays.asList("LOW_LEVEL_API");
            Response<AuthResponse> res;
            try {
                res = api.auth(new AuthRequest(app, permissions)).execute();
                if (res.isSuccessful()) {
                    authToken = "Bearer " + res.body().getToken();
                    return new Result<>(true, true);
                }
                return new Result<>(false, res.code() == 401 ? "Request denied by user" : res.message());
            } catch (IOException ex) {
                return new Result<>(false, ex.getMessage());
            }
        });
    }

    /**
     * Load application configuration from App's root directory. From the config
     * file the ID and the DataId for the StructuredData containing the list of
     * DataIds of saved messages can be obtained.
     */
    @Override
    public Future<Result<Boolean>> loadAppConfig() {
        return executor.submit(() -> {
            try {
                FileResponse file;
                String structuredDataName;
                long tempId;

                // Symmetric Cipher opt handle
                symmetricCipherOptsHandle = api.getSymmetricCipherOptHandle(authToken).execute().body().getHandleId();

                Response<ResponseBody> res = api.getConfigFile(authToken).execute();
                if (!res.isSuccessful()) {
                    return new Result(true, true);
                }
                Headers headers = res.headers();
                file = new FileResponse(headers.get("Content-Type"), headers.get("Metadata"), res.body().bytes());

                appConfig = new Gson().fromJson(new String(file.getContent()), AppConfig.class);
                // Fetch handles
                structuredDataName = appConfig.getStructuredDataName();
                // SD Handle                
                tempId = api.getDataId(authToken, new StructuredDataDataId(structuredDataName, UNVERSIONED_SD_TAG)).execute().body().getHandleId();
                structuredDataHandle = api.getStructuredDataHandle(authToken, tempId).execute().body().getHandleId();

                inboxMessages = this.fetchInbox().get().getData();
                savedMessages = this.fetchSavedMessages().get().getData();
                return new Result<Boolean>(true, true);
            } catch (Exception e) {
                return new Result<Boolean>(false, e.toString());
            }
        });
    }

    @Override
    public boolean hasId() {
        return appConfig != null && appConfig.getId() != null && !appConfig.getId().isEmpty();
    }

    @Override
    public String getId() {
        return appConfig == null ? null : appConfig.getId();
    }

    /**
     * Invoked to create the ID in the network. An AppendableData is created in
     * the network with name derived from the ID provided by the user. A
     *
     * StructuredData with random ID is created for storing the DataId list of
     * the saved messages.
     *
     * The data in the SD is stored after Symmetric Encryption
     *
     * When the application starts the ID and the StructuredData name is stored
     * is fetched from a config file in the application's root directory Once
     * the AppendableData and StructuredData are created the AppConfig is stored
     * as a JSON file (config file)
     *
     * @param id
     * @return
     */
    @Override
    public Future<Result<Boolean>> createID(String id) {
        return executor.submit(() -> {
            try {
                String appendableDataName;
                String structuredDataName;
                StructuredDataCreateRequest sdCreateReq;
                AppendableDataCreateRequest adCreateReq;
                long appendableDataHandle;
                byte[] randomSDName;
                // Generate random SD name 
                randomSDName = new byte[32];
                new Random().nextBytes(randomSDName);
                structuredDataName = Base64.getEncoder().encodeToString(randomSDName);
                // Hash ID 
                appendableDataName = getBase64Name(id);
                // Prepare config file data
                appConfig = new AppConfig();
                appConfig.setId(id);
                appConfig.setStructuredDataName(structuredDataName);
                // Create AD
                adCreateReq = new AppendableDataCreateRequest(appendableDataName, true);
                Response<HandleIdResponse> res = api.createAppendabledData(authToken, adCreateReq).execute();
                if (res.code() != 200) {
                    return new Result<>(false, "Id not available. " + res.message());
                }
                appendableDataHandle = res.body().getHandleId();
                // Invoke PUT endpoint for creating AD
                api.saveAppendableData(authToken, appendableDataHandle).execute();
                // Create SD for saved messages bby passing symmetric cipher opts handle                     
                sdCreateReq = new StructuredDataCreateRequest(appConfig.getStructuredDataName(), UNVERSIONED_SD_TAG, symmetricCipherOptsHandle, Base64.getEncoder().encodeToString("[]".getBytes()));
                structuredDataHandle = api.createStructuredData(authToken, sdCreateReq).execute().body().getHandleId();
                api.saveStructuredData(authToken, structuredDataHandle).execute();
                // Create config file
                api.createConfigFile(authToken, appConfig).execute();
                return new Result<>(true, true);
            } catch (Exception e) {
                return new Result<>(false, e.toString());
            }
        });
    }

    /**
     * Fetch messages from the user's inbox (AppendableData) Get AppendableData
     * from the network and get the size of data available. Iterate and get
     * DataId at every index based on the available size. From the DataId, read
     * the immutable data from the network Deserialise the JSON to Message
     * object and add the inboxMessages list
     *
     * @return
     */
    @Override
    public Future<Result<List<Message>>> fetchInbox() {
        return executor.submit(() -> {
            String jsonString;
            long tempDataIdHandle;
            long tempReaderHandle;
            Message msg;
            String appendableDataName;
            try {
                // Fetch private AD from network
                appendableDataName = getBase64Name(appConfig.getId());
                long tempId = api.getDataId(authToken, new AppendableDataDataId(appendableDataName, true)).execute().body().getHandleId();
                long appendableDataHandle = api.getAppendableDataHandle(authToken, tempId).execute().body().getHandleId();
                // Get length of data in the AD
                long dataLength = api.getAppendableDataMetadata(authToken, appendableDataHandle).execute().body().getDataLength();
                inboxMessages.clear();
                // Read immutable data using ID reader for every DataId based on the index from the appendable data
                for (int i = 0; i < dataLength; i++) {
                    tempDataIdHandle = api.getDataFromAppendableData(authToken, appendableDataHandle, i).execute().body().getHandleId();
                    tempReaderHandle = api.getImmutableDataReader(authToken, tempDataIdHandle).execute().body().getHandleId();
                    jsonString = new String(api.readImmutableData(authToken, tempReaderHandle).execute().body().bytes());
                    msg = new Gson().fromJson(jsonString, Message.class);
                    msg.setIndex(i);
                    inboxMessages.add(msg);
                    // Drop the handles
                    api.dropDataId(authToken, tempDataIdHandle).execute();
                    api.dropImmutableDataReader(authToken, tempReaderHandle).execute();
                }
                return new Result<List<Message>>(true, inboxMessages);
            } catch (Exception e) {
                return new Result<List<Message>>(true, e.toString());
            }
        });
    }

    /**
     * Get saved messages from StructuredData Read SD and get the DataId list
     * for fetching the saved messages Iterate and read each message
     *
     * @return
     */
    @Override
    public Future<Result<List<Message>>> fetchSavedMessages() {
        return executor.submit(() -> {
            try {
                RequestBody req;
                int i = 0;
                long tempHandle;
                long tempReaderHandle;
                Message msg;
                String jsonString = new String(api.readStructuredData(authToken, structuredDataHandle).execute().body().bytes());
                savedMessagesDataIdList = new Gson().fromJson(jsonString, new ArrayList<String>().getClass());
                savedMessages.clear();
                for (String dtataId : savedMessagesDataIdList) {
                    req = RequestBody.create(MediaType.parse("application/octet-stream"), Base64.getDecoder().decode(dtataId));
                    tempHandle = api.deserialiseDataId(authToken, req).execute().body().getHandleId();
                    tempReaderHandle = api.getImmutableDataReader(authToken, tempHandle).execute().body().getHandleId();
                    jsonString = new String(api.readImmutableData(authToken, tempReaderHandle).execute().body().bytes());
                    msg = new Gson().fromJson(jsonString, Message.class);
                    msg.setIndex(i);
                    savedMessages.add(msg);
                    // Drop the handles
                    api.dropDataId(authToken, tempHandle).execute();
                    api.dropImmutableDataReader(authToken, tempReaderHandle).execute();
                    i++;
                }
                return new Result<List<Message>>(true, savedMessages);
            } catch (Exception e) {
                return new Result<List<Message>>(false, e.toString());
            }
        });
    }

    /**
     * Invoked to send a message The recipient's appendable data is fetched and
     * the encrypt key is obtained The message is written to the network as
     * ImmutableData and encrypted using the receiver's encrypt key (Asymmetric
     * encryption)
     * The DataId of the ImmutableData is added to the receiver's appendable data    
     * 
     * @param message
     * @return
     */
    @Override
    public Future<Result<Boolean>> sendMessage(Message message) {
        return executor.submit(() -> {
            RequestBody req;
            String toName;
            long toDataId;
            long toAppendableData;
            long dataIdForMessage;           

            toName = getBase64Name(message.getTo());
            toDataId = api.getDataId(authToken, new AppendableDataDataId(toName, true)).execute().body().getHandleId();
            Response<AppendableDataMetadata> res = api.getAppendableDataHandle(authToken, toDataId).execute();
            if (!res.isSuccessful()) {
                return new Result<Boolean>(false, "Failed to get appendable data for recepient");
            }
            toAppendableData = res.body().getHandleId();
            
            long encryptKeyHandle = api.getEncryptKey(authToken, toAppendableData).execute().body().getHandleId();
            long cipherHandle = api.getAsymmetricCipherOptHandle(authToken, encryptKeyHandle).execute().body().getHandleId();
            long writerHandle = api.getImmutableDataWritter(authToken).execute().body().getHandleId();
            req = RequestBody.create(MediaType.parse("application/octet-stream"), new Gson().toJson(message).getBytes());
            if (api.writeImmutableData(authToken, writerHandle, req).execute().code() != 200) {
                return new Result<Boolean>(false, "Failed to send the message.");
            }
            dataIdForMessage = api.closeImmutableData(authToken, writerHandle, cipherHandle).execute().body().getHandleId();
            if (api.appendToAppendableData(authToken, toAppendableData, dataIdForMessage).execute().code() != 200) {
                return new Result<Boolean>(false, "Failed to send the message.");
            }

            // drop handles
            api.dropEncryptKey(authToken, encryptKeyHandle).execute();
            api.dropCipherOptHandle(authToken, cipherHandle).execute();
            api.dropImmutableDataWriter(authToken, writerHandle).execute();
            api.dropDataId(authToken, dataIdForMessage).execute();
            api.dropDataId(authToken, toDataId).execute();
            api.dropAppendableDataHandle(authToken, toAppendableData);            
            return new Result<Boolean>(true, true);
        });
    }

    /**
     * Save the message from inbox to the Structured Data
     * Fetch the DataId of the message from the appendable data
     * Read the message and save it as symmetric encrypted ImmutableData
     * The DataId of the ImmutableData is serialised and stored in the SD
     * The message is also removed from the AppendableData
     * 
     * @param message
     * @return 
     */
    @Override
    public Future<Result<Boolean>> saveMessage(Message message) {
        return executor.submit(() -> {
            try {

                // Get DataId from AD
                String appendableDataName = getBase64Name(appConfig.getId());
                long dataIdHandle = api.getDataId(authToken, new AppendableDataDataId(appendableDataName, true)).execute().body().getHandleId();
                long appendableDataHandle = api.getAppendableDataHandle(authToken, dataIdHandle).execute().body().getHandleId();
                long msgDataId = api.getDataFromAppendableData(authToken, appendableDataHandle, message.getIndex()).execute().body().getHandleId();
                // read msg from ImmtableData                
                long readerHandle = api.getImmutableDataReader(authToken, msgDataId).execute().body().getHandleId();
                api.dropDataId(authToken, msgDataId).execute();
                byte[] msg = api.readImmutableData(authToken, readerHandle).execute().body().bytes();
                api.dropImmutableDataReader(authToken, readerHandle).execute();
                long writerHandle = api.getImmutableDataWritter(authToken).execute().body().getHandleId();
                RequestBody req = RequestBody.create(MediaType.parse("application/octet-stream"), msg);
                api.writeImmutableData(authToken, writerHandle, req).execute();
                msgDataId = api.closeImmutableData(authToken, writerHandle, symmetricCipherOptsHandle).execute().body().getHandleId();
                api.dropImmutableDataWriter(authToken, writerHandle).execute();
                // Write new Id
                String serialisedDataId = Base64.getEncoder().encodeToString(api.serialiseDataId(authToken, msgDataId).execute().body().bytes());
                savedMessagesDataIdList.add(serialisedDataId);
                api.dropAppendableDataHandle(authToken, appendableDataHandle).execute();

                String data = Base64.getEncoder().encodeToString(new Gson().toJson(savedMessagesDataIdList).getBytes());
                if (api.updateDataOfStructuredData(authToken, structuredDataHandle, new StructuredDataUpdateRequest(symmetricCipherOptsHandle, data)).execute().code() != 200
                        || api.updateStructuredData(authToken, structuredDataHandle).execute().code() != 200) {
                    return new Result(false, "Failed to save the message");
                }
                deleteFromAppendableData(message);
                message.setIndex(savedMessages.size());
                savedMessages.add(message);
                return new Result<Boolean>(true, true);
            } catch (Exception e) {
                return new Result<Boolean>(false, e.toString());
            }
        });
    }

    @Override
    public Future<Result<Boolean>> deleteMessage(Message message, boolean fromInbox) {
        return executor.submit(() -> {
            if (fromInbox) {
                return deleteFromAppendableData(message) ? new Result(true, true) : new Result(false, "Failed to delete");
            } else {
                return deleteFromStructuredData(message) ? new Result(true, true) : new Result(false, "Failed to delete");
            }
        });
    }

    @Override
    public List<Message> getInbox() {
        return inboxMessages;
    }

    @Override
    public List<Message> getSavedMessages() {
        return savedMessages;
    }

    /**
     * Invoked to hash the name and convert to a base64 string base64 string
     * represents - byte[32]
     *
     * @param name
     * @return String
     * @throws Exception
     */
    private String getBase64Name(String name) throws Exception {
        MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
        messageDigest.update(name.getBytes());
        return Base64.getEncoder().encodeToString(messageDigest.digest());
    }

    private boolean deleteFromAppendableData(Message msg) throws Exception {
        String appendableDataName = getBase64Name(appConfig.getId());
        long dataIdHandle = api.getDataId(authToken, new AppendableDataDataId(appendableDataName, true)).execute().body().getHandleId();
        long appendableDataHandle = api.getAppendableDataHandle(authToken, dataIdHandle).execute().body().getHandleId();
        if (api.deleteDataAtIndex(authToken, appendableDataHandle, msg.getIndex()).execute().code() != 200
                || api.updateAppendableData(authToken, appendableDataHandle).execute().code() != 200) {
            return false;
        }
        inboxMessages.remove(msg);
        // Drop AD handle
        api.dropAppendableDataHandle(authToken, appendableDataHandle);
        // Get new AD handle for clearing deleted data
        appendableDataHandle = api.getAppendableDataHandle(authToken, dataIdHandle).execute().body().getHandleId();
        api.clearDeleteData(authToken, appendableDataHandle).execute();
        api.saveAppendableData(authToken, appendableDataHandle);
        // Drop all handles
        api.dropDataId(authToken, dataIdHandle);
        api.dropAppendableDataHandle(authToken, appendableDataHandle);

        return true;
    }

    private boolean deleteFromStructuredData(Message msg) throws Exception {
        savedMessagesDataIdList.remove((int) msg.getIndex());
        String data = Base64.getEncoder().encodeToString(new Gson().toJson(savedMessagesDataIdList).getBytes());
        if (api.updateDataOfStructuredData(authToken, structuredDataHandle, new StructuredDataUpdateRequest(symmetricCipherOptsHandle, data)).execute().code() != 200
                || api.updateStructuredData(authToken, structuredDataHandle).execute().code() != 200) {
            return false;
        }
        return true;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        throw new CloneNotSupportedException();
    }

}
