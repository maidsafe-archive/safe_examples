package net.maidsafe.example.mail.scene;

import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import net.maidsafe.example.mail.controller.IdCreationController;

/**
 *
 * @author Krishna
 */
public class IdCreationScene extends BaseScene implements IdCreationController.ViewEvent {

    private IdCreationController controller;
    private TextField idInput;

    public IdCreationScene(Stage stage) {
        super(stage);
        controller = new IdCreationController(this);
    }

    private void submit() {
        if (idInput.getText().trim().isEmpty()) {
            handleError("Wrong Input", "Id can not be empty", null);
            return;
        }
        toggleSpinner();
        controller.createId(idInput.getText().trim());
    }

    private EventHandler<KeyEvent> onEnterPressed = (event) -> {
        if (event.getCode() == KeyCode.ENTER) {
            submit();
        }
    };

    private EventHandler<ActionEvent> onCreateClicked = (e) -> submit();

    @Override
    public Scene getScene() {
        Label label;
        Button createBtn;
        VBox vBox;

        label = new Label("Create your ID for Messaging");
        idInput = new TextField();
        idInput.setPromptText("Enter an ID of your choice");
        idInput.setMaxWidth(WIDTH / 3);
        createBtn = new Button("Create");
        createBtn.setOnAction(onCreateClicked);
        createBtn.setOnKeyPressed(onEnterPressed);
        createBtn.requestFocus();
        vBox = new VBox(label, idInput, createBtn);
        vBox.setAlignment(Pos.CENTER);
        vBox.setSpacing(15);
        return new Scene(new StackPane(vBox, getSpinner()), WIDTH, HEIGHT);
    }

    @Override
    public void onError(String title, String message) {
        toggleSpinner();
        handleError(title, message, null);
    }

    @Override
    public void created() {
        toggleSpinner();
        stage.setScene(new HomeScene(stage, idInput.getText().trim()).getScene());
    }
}
