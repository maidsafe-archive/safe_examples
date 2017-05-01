package net.maidsafe.example.mail.model;

/**
 *
 * @author Krishna
 */
public class Result<T> {

    private boolean success;
    private String errorMessage;
    private T data;

    public Result(boolean isSuccess, T data) {
        this.success = isSuccess;
        this.data = data;
    }

    public Result(boolean isSuccess, String errorMessage) {
        this.success = isSuccess;
        this.errorMessage = errorMessage;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public T getData() {
        return data;
    }

}
