package net.maidsafe.example.mail.scene;

import javafx.event.EventHandler;
import javafx.geometry.Insets;
import javafx.scene.Cursor;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.control.DialogEvent;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.Pane;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.scene.paint.Paint;
import javafx.stage.Stage;

/**
 *
 * @author Krishna
 */
public abstract class BaseScene {

    private StackPane spinner;
    
    protected final double WIDTH = 800;
    protected final double HEIGHT = 550;
    protected final Color SCENE_COLOR = Color.WHITE;    
    protected Stage stage;
    

    public BaseScene(Stage stage) {
        this.stage = stage;        
    }

    public abstract Scene getScene();

    protected void handleError(String title, String message, EventHandler<DialogEvent> eventHandler) {
        Alert errorDialog;
        errorDialog = new Alert(Alert.AlertType.NONE, message, ButtonType.OK);
        errorDialog.setTitle(title);
        errorDialog.setOnCloseRequest(eventHandler);
        errorDialog.show();
    }
    
    protected Label createActionableLabel(String title, EventHandler<MouseEvent> handler) {
        Label label;
        label = new Label(title);
        label.setUnderline(true);
        label.setCursor(Cursor.HAND);        
        label.setOnMouseClicked(handler);
        return label;
    }
    
    public StackPane getSpinner() {
        if (spinner != null) {
            return spinner;
        }
        spinner = new StackPane(new ProgressBar(ProgressBar.INDETERMINATE_PROGRESS));
        spinner.setMinSize(WIDTH, HEIGHT + 40);
        spinner.setVisible(false);
        spinner.setBackground(new Background(new BackgroundFill(Color.rgb(0, 0, 0, 0.4), CornerRadii.EMPTY, Insets.EMPTY)));
        return spinner;
    }
    
    public void toggleSpinner() {
        
        spinner.setVisible(!spinner.isVisible());
    }
    
    
}
