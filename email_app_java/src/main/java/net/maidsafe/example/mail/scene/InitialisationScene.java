package net.maidsafe.example.mail.scene;

import javafx.application.Platform;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import net.maidsafe.example.mail.controller.InitialisationController;

/**
 *
 * @author Krishna
 */
public class InitialisationScene extends BaseScene implements InitialisationController.ViewEvent {

    // TODO: Implement dependency injection
    private final InitialisationController controller;
    private Label authStatusLbl;
    private Label appInitStatusLbl;

    public InitialisationScene(Stage stage) {
        super(stage);
        controller = new InitialisationController(this);
    }

    @Override
    public Scene getScene() {
        VBox stepsLayout;
        authStatusLbl = new Label("Waiting For Authorisation");
        appInitStatusLbl = new Label("Initialising Application");
        stepsLayout = new VBox(authStatusLbl, appInitStatusLbl);
        stepsLayout.setSpacing(20);
        stepsLayout.setAlignment(Pos.CENTER);
        controller.authorise();
        return new Scene(new StackPane(stepsLayout), WIDTH, HEIGHT);
    }

    @Override
    public void onAuthorised() {
        authStatusLbl.setText("Authorised Successfully With Launcher");
        authStatusLbl.setFont(Font.font(null, FontWeight.BOLD, 15));
        controller.loadApplication();
        appInitStatusLbl.setText("Loading Application Metadata");
    }

    @Override
    public void onAppLoaded(String id) {
        BaseScene scene;
        appInitStatusLbl.setText("Application Initialised");
        scene = (id != null) ? new HomeScene(stage, id) : new IdCreationScene(stage);
        stage.setScene(scene.getScene());
    }

    @Override
    public void onError(String title, String message) {
        handleError(title, message, (event) -> System.exit(0));      
    }

}
