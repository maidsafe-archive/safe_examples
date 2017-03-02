package net.maidsafe.example.mail;

import javafx.application.Application;
import static javafx.application.Application.launch;
import javafx.stage.Stage;
import net.maidsafe.example.mail.scene.InitialisationScene;


public class MainApp extends Application {

    @Override
    public void start(Stage primaryStage) throws Exception {
        primaryStage.setTitle("SAFE Messaging");
        primaryStage.setScene(new InitialisationScene(primaryStage).getScene());
        primaryStage.show();
    }

    /**
     * The main() method is ignored in correctly deployed JavaFX application.
     * main() serves only as fallback in case the application can not be
     * launched through deployment artifacts, e.g., in IDEs with limited FX
     * support. NetBeans ignores main().
     *
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        launch(args);
    }

}
