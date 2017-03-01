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
     * Send authorisation request to SAFE Launcher On Successful authorisation
     * hold the auth token in memory
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
     * Load application configuration from App's root directory Application
     * configuration will be a JSON file Fetch the appendable and structured
     * data handles
     */
    @Override
    public Future<Result<Boolean>> loadAppConfig() {
        return executor.submit(() -> {
            try {
                FileResponse file;
                String structuredDataName;
                long tempId;
                Response<ResponseBody> res = api.getConfigFile(authToken).execute();
                if (!res.isSuccessful()) {
                    return new Result(false, res.code() + " - " + res.message());
                }
                Headers headers = res.headers();
                file = new FileResponse(headers.get("Content-Type"), headers.get("Metadata"), res.body().bytes());

                appConfig = new Gson().fromJson(new String(file.getContent()), AppConfig.class);
                // Fetch handles
                structuredDataName = appConfig.getStructuredDataName();
                // Symmetric Cipher opt handle
                symmetricCipherOptsHandle = api.getSymmetricCipherOptHandle(authToken).execute().body().getHandleId();
                // SD Handle                
                tempId = api.getDataId(authToken, new StructuredDataDataId(structuredDataName, UNVERSIONED_SD_TAG)).execute().body().getHandleId();
                structuredDataHandle = api.getStructuredDataHandle(authToken, tempId).execute().body().getHandleId();

                inboxMessages = this.fetchInbox().get().getData();
                savedMessages = this.fetchSavedMessages().get().getData();
                return new Result<Boolean>(true, true);
            } catch (Exception e) {
                return new Result<Boolean>(false, e.getMessage());
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
     * Creates the appendable data for the ID Create the appendable and
     * structured data and get the handles Creates the AppConfig file for the
     * application to bootstrap
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
                appendableDataName = getBase64Name(id);
                structuredDataName = getBase64Name("config-" + id);
                appConfig = new AppConfig();
                appConfig.setId(id);
                appConfig.setSstructuredDataName(structuredDataName);
                // Create AD
                adCreateReq = new AppendableDataCreateRequest(appendableDataName, true);
                Response<HandleIdResponse> res = api.createAppendabledData(authToken, adCreateReq).execute();
                if (res.code() != 200) {
                    return new Result<>(false, "Id not available. " + res.message());
                }
                appendableDataHandle = res.body().getHandleId();
                api.saveAppendableData(authToken, appendableDataHandle).execute();
                // Create SD for saved messages                      
                sdCreateReq = new StructuredDataCreateRequest(appConfig.getStructuredDataName(), UNVERSIONED_SD_TAG, symmetricCipherOptsHandle, Base64.getEncoder().encodeToString("[]".getBytes()));
                structuredDataHandle = api.createStructuredData(authToken, sdCreateReq).execute().body().getHandleId();
                api.saveStructuredData(authToken, structuredDataHandle).execute();
                // Create config file
                api.createConfigFile(authToken, appConfig).execute();
                return new Result<Boolean>(true, true);
            } catch (Exception e) {
                return new Result<>(false, e.getMessage());
            }
        });
    }

    /**
     * Fetch the appendable data from the network
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
                appendableDataName = getBase64Name(appConfig.getId());
                long tempId = api.getDataId(authToken, new AppendableDataDataId(appendableDataName, true)).execute().body().getHandleId();
                long appendableDataHandle = api.getAppendableDataHandle(authToken, tempId).execute().body().getHandleId();
                long dataLength = api.getAppendableDataMetadata(authToken, appendableDataHandle).execute().body().getDataLength();
                inboxMessages.clear();

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
                return new Result<List<Message>>(true, e.getMessage());
            }
        });
    }

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
                return new Result<List<Message>>(false, e.getMessage());
            }
        });
    }

    @Override
    public Future<Result<Boolean>> sendMessage(Message message) {
        return executor.submit(() -> {
            RequestBody req;
            String toName;
            long toAppendableData;
            long dataIdForMessage;

            String appendableDataName = getBase64Name(appConfig.getId());
            long dataIdHandle = api.getDataId(authToken, new AppendableDataDataId(appendableDataName, true)).execute().body().getHandleId();
            long appendableDataHandle = api.getAppendableDataHandle(authToken, dataIdHandle).execute().body().getHandleId();
            long encryptKeyHandle = api.getEncryptKey(authToken, appendableDataHandle).execute().body().getHandleId();
            long cipherHandle = api.getAsymmetricCipherOptHandle(authToken, encryptKeyHandle).execute().body().getHandleId();
            long writerHandle = api.getImmutableDataWritter(authToken).execute().body().getHandleId();
            req = RequestBody.create(MediaType.parse("application/octet-stream"), new Gson().toJson(message).getBytes());
            if (api.writeImmutableData(authToken, writerHandle, req).execute().code() != 200) {
                return new Result<Boolean>(false, "Failed to send the message.");
            }
            dataIdForMessage = api.closeImmutableData(authToken, writerHandle, cipherHandle).execute().body().getHandleId();
            toName = getBase64Name(message.getTo());
            toAppendableData = api.getDataId(authToken, new AppendableDataDataId(toName, true)).execute().body().getHandleId();
            Response<AppendableDataMetadata> res = api.getAppendableDataHandle(authToken, toAppendableData).execute();
            if (!res.isSuccessful()) {
                return new Result<Boolean>(false, "Failed to get appendable data for recepient");
            }
            toAppendableData = res.body().getHandleId();
            if (api.appendToAppendableData(authToken, toAppendableData, dataIdForMessage).execute().code() != 200) {
                return new Result<Boolean>(false, "Failed to send the message.");
            }

            // drop handles
            api.dropEncryptKey(authToken, encryptKeyHandle).execute();
            api.dropCipherOptHandle(authToken, cipherHandle).execute();
            api.dropImmutableDataWriter(authToken, writerHandle).execute();
            api.dropDataId(authToken, dataIdHandle).execute();
            api.dropDataId(authToken, dataIdForMessage).execute();
            api.dropAppendableDataHandle(authToken, toAppendableData);
            api.dropAppendableDataHandle(authToken, appendableDataHandle);
            return new Result<Boolean>(true, true);
        });
    }

    @Override
    public Future<Result<Boolean>> saveMessage(Message message) {
        return executor.submit(() -> {
            try {

                // Get DataId from AD
                String appendableDataName = getBase64Name(appConfig.getId());
                long dataIdHandle = api.getDataId(authToken, new AppendableDataDataId(appendableDataName, true)).execute().body().getHandleId();
                long appendableDataHandle = api.getAppendableDataHandle(authToken, dataIdHandle).execute().body().getHandleId();
                long msgDataId = api.getDataFromAppendableData(authToken, appendableDataHandle, message.getIndex()).execute().body().getHandleId();
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
                return new Result<Boolean>(false, e.getMessage());
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
