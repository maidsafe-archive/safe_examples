package net.maidsafe.example.mail.dao;

import net.maidsafe.example.mail.modal.AppConfig;
import net.maidsafe.example.mail.modal.AppendableDataCreateRequest;
import net.maidsafe.example.mail.modal.AppendableDataDataId;
import net.maidsafe.example.mail.modal.AppendableDataMetadata;
import net.maidsafe.example.mail.modal.AuthRequest;
import net.maidsafe.example.mail.modal.AuthResponse;
import net.maidsafe.example.mail.modal.HandleIdResponse;
import net.maidsafe.example.mail.modal.ReaderInfo;
import net.maidsafe.example.mail.modal.StructuredDataCreateRequest;
import net.maidsafe.example.mail.modal.StructuredDataDataId;
import net.maidsafe.example.mail.modal.StructuredDataMetadata;
import net.maidsafe.example.mail.modal.StructuredDataUpdateRequest;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.PATCH;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

/**
 *
 * @author Krishna
 */
public interface IRestAPI {

    @POST("auth")
    Call<AuthResponse> auth(@Body AuthRequest demo);

    // NFS
    @POST("nfs/file/app/config.json")
    Call<Void> createConfigFile(@Header("Authorization") String authorisation, @Body AppConfig config);

    @GET("nfs/file/app/config.json")
    Call<ResponseBody> getConfigFile(@Header("Authorization") String authorisation);

    // STRUCTURED DATA
    @POST("structured-data")
    Call<HandleIdResponse> createStructuredData(@Header("Authorization") String authorisation, @Body StructuredDataCreateRequest sd);

    @PUT("structured-data/{handle}")
    Call<Void> saveStructuredData(@Header("Authorization") String authorisation, @Path("handle") long handle);

    @POST("structured-data/{handle}")
    Call<Void> updateStructuredData(@Header("Authorization") String authorisation, @Path("handle") long handle);

    
    @GET("structured-data/handle/{handleId}")
    Call<StructuredDataMetadata> getStructuredDataHandle(@Header("Authorization") String authorisation, @Path("handleId") long handleId);

    @GET("structured-data/{handle}")
    Call<ResponseBody> readStructuredData(@Header("Authorization") String authorisation, @Path("handle") long handle);

    @PATCH("structured-data/{handle}")
    Call<Void> updateDataOfStructuredData(@Header("Authorization") String authorisation, @Path("handle") long handle, @Body StructuredDataUpdateRequest req);
    // APPENDABLE DATA
    @POST("appendable-data")
    Call<HandleIdResponse> createAppendabledData(@Header("Authorization") String authorisation, @Body AppendableDataCreateRequest ad);

    @PUT("appendable-data/{handle}")
    Call<Void> saveAppendableData(@Header("Authorization") String authorisation, @Path("handle") long handle);

    @POST("appendable-data/{handle}")
    Call<Void> updateAppendableData(@Header("Authorization") String authorisation, @Path("handle") long handle);

    
    @GET("appendable-data/handle/{handleId}")
    Call<AppendableDataMetadata> getAppendableDataHandle(@Header("Authorization") String authorisation, @Path("handleId") long handleId);

    @GET("appendable-data/metadata/{handleId}")
    Call<AppendableDataMetadata> getAppendableDataMetadata(@Header("Authorization") String authorisation, @Path("handleId") long handleId);

    @GET("appendable-data/{handleId}/{index}")
    Call<HandleIdResponse> getDataFromAppendableData(@Header("Authorization") String authorisation, @Path("handleId") long handleId, @Path("index") long index);

    @GET("appendable-data/encrypt-key/{handleId}")
    Call<HandleIdResponse> getEncryptKey(@Header("Authorization") String authorisation, @Path("handleId") long handleId);
    
    @PUT("appendable-data/{handleId}/{dataIdHandle}")
    Call<Void> appendToAppendableData(@Header("Authorization") String authorisation, @Path("handleId") long handleId, @Path("dataIdHandle") long dataIdHandle);
    
    @DELETE("appendable-data/{handleId}/{index}")
    Call<Void> deleteDataAtIndex(@Header("Authorization") String authorisation, @Path("handleId") long handleId, @Path("index") long index);
    
    @DELETE("appendable-data/clear-deleted-data/{handleId}")
    Call<Void> clearDeleteData(@Header("Authorization") String authorisation, @Path("handleId") long handleId);
    
    @DELETE("appendable-data/encrypt-key/{handleId}")
    Call<Void> dropEncryptKey(@Header("Authorization") String authorisation, @Path("handleId") long handleId);
    
    @DELETE("appendable-data/handle/{handleId}")
    Call<Void> dropAppendableDataHandle(@Header("Authorization") String authorisation, @Path("handleId") long handleId);
    
    // CIPHER-OPTS
    @GET("cipher-opts/SYMMETRIC")
    Call<HandleIdResponse> getSymmetricCipherOptHandle(@Header("Authorization") String authorisation);

    @GET("cipher-opts/ASYMMETRIC/{encKeyHandle}")
    Call<HandleIdResponse> getAsymmetricCipherOptHandle(@Header("Authorization") String authorisation, @Path("encKeyHandle") long encKeyHandle);
    
    @DELETE("cipher-opts/{handle}")
    Call<Void> dropCipherOptHandle(@Header("Authorization") String authorisation, @Path("handle") long handle);
    
    // DATA-ID
    @POST("data-id/structured-data")
    Call<HandleIdResponse> getDataId(@Header("Authorization") String authorisation, @Body StructuredDataDataId sd);

    @POST("data-id/appendable-data")
    Call<HandleIdResponse> getDataId(@Header("Authorization") String authorisation, @Body AppendableDataDataId ad);

    @POST("data-id")
    Call<HandleIdResponse> deserialiseDataId(@Header("Authorization") String authorisation, @Body RequestBody body);
    
    @GET("data-id/{handle}")
    Call<ResponseBody> serialiseDataId(@Header("Authorization") String authorisation, @Path("handle") long handle);

    @DELETE("data-id/{handle}")
    Call<Void> dropDataId(@Header("Authorization") String authorisation, @Path("handle") long handle);

    // IMMUTABLE DATA
    @GET("immutable-data/reader/{handleId}")
    Call<ReaderInfo> getImmutableDataReader(@Header("Authorization") String authorisation, @Path("handleId") long handleId);

    @GET("immutable-data/{handleId}")
    Call<ResponseBody> readImmutableData(@Header("Authorization") String authorisation, @Path("handleId") long handleId);

    @GET("immutable-data/writer")
    Call<HandleIdResponse> getImmutableDataWritter(@Header("Authorization") String authorisation);
    
    @POST("immutable-data/{handleId}")
    Call<Void> writeImmutableData(@Header("Authorization") String authorisation, @Path("handleId") long handleId, @Body RequestBody data);
    
    @PUT("immutable-data/{handleId}/{cipherOpts}")
    Call<HandleIdResponse> closeImmutableData(@Header("Authorization") String authorisation, @Path("handleId") long handleId, @Path("cipherOpts") long cipherOpts);
    
    @DELETE("immutable-data/reader/{handleId}")
    Call<Void> dropImmutableDataReader(@Header("Authorization") String authorisation, @Path("handleId") long handleId);
    
    @DELETE("immutable-data/writer/{handleId}")
    Call<Void> dropImmutableDataWriter(@Header("Authorization") String authorisation, @Path("handleId") long handleId);
    
}
