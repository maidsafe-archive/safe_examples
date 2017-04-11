package net.maidsafe.example.mail.util;

import java.util.concurrent.Future;
import javafx.application.Platform;
import javafx.concurrent.Service;
import javafx.concurrent.Task;
import net.maidsafe.example.mail.model.Result;

/**
 * Blocking operations are threaded and once the result is obtained the
 * onResult function is invoked to execute in the UI thread.
 * @author MaidSafe
 */
public abstract class ServiceHandler<T> {

    private final Future<Result<T>> resutToWaitFor;

    public ServiceHandler(Future<Result<T>> resultToWaitFor) {
        this.resutToWaitFor = resultToWaitFor;
    }
    
    public void start() {
        new Service<Void>() {

            @Override
            protected Task<Void> createTask() {
                return new Task<Void>() {

                    @Override
                    protected Void call() throws Exception {                        
                        Result<T> result = resutToWaitFor.get();
                        Platform.runLater(() -> {                            
                            onResult(result);
                        });
                        return null;
                    }
                };
            }

        }.start();
    }

    public abstract void onResult(Result<T> result);
}
