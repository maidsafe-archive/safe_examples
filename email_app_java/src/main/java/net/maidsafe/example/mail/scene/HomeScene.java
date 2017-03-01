/*0-
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package net.maidsafe.example.mail.scene;

import java.util.List;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.Background;
import javafx.scene.layout.BackgroundFill;
import javafx.scene.layout.Border;
import javafx.scene.layout.BorderStroke;
import javafx.scene.layout.BorderStrokeStyle;
import javafx.scene.layout.BorderWidths;
import javafx.scene.layout.ColumnConstraints;
import javafx.scene.layout.CornerRadii;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.RowConstraints;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import net.maidsafe.example.mail.controller.AppController;
import net.maidsafe.example.mail.modal.Message;

/**
 *
 * @author Krishna
 */
public class HomeScene extends BaseScene implements AppController.ViewState {

    private final String id;
    private final int TOP_MARGIN = 20;
    private ViewState viewState = ViewState.INBOX;
    private HBox mainPannel;
    private Label inboxLabel;
    private Label savedMsgsLabel;
    private Label refreshAction;
    
    private final double LEFT_MENU_WIDTH = WIDTH / 4;
    private final double MESSAGES_LIST_VIEW_WIDTH = WIDTH - (WIDTH / 3) + 30;

    private final AppController controller;

    @Override
    public void onInboxMessages(List<Message> messages) {
        toggleSpinner();
        updateView(ViewState.INBOX);
    }

    @Override
    public void onInboxRefreshed(List<Message> messages) {
        toggleSpinner();
        updateView(ViewState.INBOX);
    }

    @Override
    public void onSavedMessages(List<Message> messages) {
        toggleSpinner();
        updateView(ViewState.SAVED_MSGS);
    }

    @Override
    public void onMessageSent() {
        toggleSpinner();
        updateView(ViewState.INBOX);
    }

    @Override
    public void onError(String title, String message) {
        toggleSpinner();
        handleError(title, message, null);
    }

    private enum ViewState {

        INBOX,
        SAVED_MSGS,
        NEW_MSG
    };

    public HomeScene(Stage stage, String id) {
        super(stage);
        this.id = id;
        controller = new AppController(this);
    }

    private GridPane getTopBar() {
        Label welcomeLabel;
        Label newMessageAction;
        HBox hBox;
        GridPane grid;

        welcomeLabel = new Label(id);
        welcomeLabel.setTranslateX(TOP_MARGIN);
        welcomeLabel.setFont(Font.font(id, FontWeight.BOLD, 16));
        welcomeLabel.setTextFill(Color.WHITE);

        newMessageAction = createActionableLabel("New Message", e -> updateView(ViewState.NEW_MSG));
        newMessageAction.setTextFill(Color.WHITE);

        refreshAction = createActionableLabel("Refresh", e -> {
            toggleSpinner();
            controller.refreshInbox();
        });
        refreshAction.setTextFill(Color.WHITE);

        hBox = new HBox(refreshAction, newMessageAction);
        hBox.setSpacing(20);
        hBox.setPadding(new Insets(10));
        hBox.setTranslateX(WIDTH / 3 + TOP_MARGIN - 100);

        grid = new GridPane();
        grid.add(welcomeLabel, 0, 0);
        grid.add(hBox, 1, 0);
        grid.getColumnConstraints().add(new ColumnConstraints(WIDTH / 2));
        grid.getRowConstraints().add(new RowConstraints(40));
        grid.setBackground(new Background(new BackgroundFill(Color.rgb(85, 146, 215), CornerRadii.EMPTY, Insets.EMPTY)));
        return grid;
    }

    private VBox getMenuLayout() {
        VBox menuLayout;

        inboxLabel = createActionableLabel("Inbox", e -> updateView(ViewState.INBOX));
        savedMsgsLabel = createActionableLabel("Saved", e -> updateView(ViewState.SAVED_MSGS));

        menuLayout = new VBox(inboxLabel, savedMsgsLabel);
        menuLayout.setMinSize(LEFT_MENU_WIDTH, HEIGHT);
        menuLayout.setSpacing(15);
        menuLayout.setPadding(new Insets(15));
        menuLayout.setBackground(new Background(new BackgroundFill(Color.WHITE, CornerRadii.EMPTY, Insets.EMPTY)));
        menuLayout.setBorder(new Border(new BorderStroke(Color.BLACK, BorderStrokeStyle.SOLID, CornerRadii.EMPTY, BorderWidths.DEFAULT)));
        return menuLayout;
    }

    private StackPane noMessagesView() {
        StackPane stackPane;
        Label label;
        label = new Label("No Messages Available");
        label.setMinWidth(MESSAGES_LIST_VIEW_WIDTH);
        label.setFont(Font.font(null, FontWeight.BOLD, 14));
        label.setAlignment(Pos.CENTER);
        stackPane = new StackPane(label);
        return stackPane;
    }

    private VBox getMessageView(Message msg, boolean isInboxView) {
        VBox msgView;
        Label subject;
        Label msgContent;
        Label fromLabel;
        Label saveLabel;
        Label deleteLabel;
        HBox bottomRow;

        subject = new Label(msg.getSubject());
        subject.setFont(Font.font(null, FontWeight.BOLD, 14));

        msgContent = new Label(msg.getMessage());

        fromLabel = new Label(msg.getFrom() + ", " + msg.getTime());
        fromLabel.setMinWidth(MESSAGES_LIST_VIEW_WIDTH - 150);
        deleteLabel = createActionableLabel("Delete", (e) -> {
            toggleSpinner();
            controller.deleteMessage(msg, isInboxView);
        });
        if (isInboxView) {
            saveLabel = createActionableLabel("Save", (e) -> {
                toggleSpinner();
                controller.saveMessage(msg);
            });
            bottomRow = new HBox(fromLabel, saveLabel, deleteLabel);
        } else {
            bottomRow = new HBox(fromLabel, deleteLabel);
        }

        bottomRow.setSpacing(10);

        msgView = new VBox(subject, msgContent, bottomRow);
        msgView.setMinWidth(MESSAGES_LIST_VIEW_WIDTH);
        msgView.setBackground(new Background(new BackgroundFill(Color.WHITE, CornerRadii.EMPTY, Insets.EMPTY)));
        msgView.setPadding(new Insets(15));
        msgView.setSpacing(10);
        return msgView;
    }

    private ScrollPane getMessagesListLayout(List<Message> msgs, boolean isInboxView) {
        VBox vbox;
        ObservableList<Node> nodes;
        vbox = new VBox();
        vbox.setSpacing(10);
        vbox.setPadding(new Insets(10, 30, 10, 10));
        nodes = vbox.getChildren();
        if (msgs.isEmpty()) {
            nodes.add(noMessagesView());
        } else {
            msgs.forEach(msg -> nodes.add(getMessageView(msg, isInboxView)));
        }
        return new ScrollPane(vbox);
    }

    private Node getNewMessageView() {
        TextField to;
        TextField subject;
        TextArea message;
        Label sendAction;
        Label cancelAction;
        HBox hbox;
        VBox vbox;

        to = new TextField();
        to.setPromptText("To");

        subject = new TextField();
        subject.setPromptText("Subject");

        message = new TextArea();
        message.setPromptText("Message to be be sent. Only 250 characters allowed");

        sendAction = createActionableLabel("Send", (e) -> {
            toggleSpinner();
            if (to.getText().trim().isEmpty()) {
                handleError("Invalid Input", "TO can not be empty ", null);
            } else if (subject.getText().trim().isEmpty()) {
                handleError("Invalid Input", "Subject can not be empty ", null);
            } else if (message.getText().trim().isEmpty()) {
                handleError("Invalid Input", "Message can not be empty ", null);
            } else if (message.getText().length() > 250) {
                handleError("Invalid Input", "Message can not be more than 250 characters", null);
            } else {
                controller.sendMessage(new Message(to.getText().trim(), id, subject.getText(), message.getText()));
            }
        });
        cancelAction = createActionableLabel("Cancel", e -> updateView(ViewState.INBOX));

        hbox = new HBox(sendAction, cancelAction);
        hbox.setSpacing(30);

        vbox = new VBox(to, subject, message, hbox);
        vbox.setSpacing(15);
        vbox.setPadding(new Insets(20));
        return vbox;
    }

    private void updateView(ViewState toState) {
        viewState = toState;
        mainPannel.getChildren().remove(1);
        mainPannel.getChildren().add(getView());
    }

    private Node getView() {
        switch (viewState) {
            case INBOX:                
                inboxLabel.setFont(Font.font(null, FontWeight.BOLD, 16));
                savedMsgsLabel.setFont(Font.font(null, FontWeight.THIN, 14));
                refreshAction.setVisible(true);
                return getMessagesListLayout(controller.getInbox(), true);

            case SAVED_MSGS:                
                refreshAction.setVisible(false);
                savedMsgsLabel.setFont(Font.font(null, FontWeight.BOLD, 16));
                inboxLabel.setFont(Font.font(null, FontWeight.THIN, 14));
                return getMessagesListLayout(controller.getSavedMessages(), false);

            case NEW_MSG:
                refreshAction.setVisible(false);
                return getNewMessageView();

            default:
                return null;
        }
    }

    private HBox getMainPannel() {
        mainPannel = new HBox(getMenuLayout(), getView());
        return mainPannel;
    }

    @Override
    public Scene getScene() {
        StackPane root;
        VBox mainLayout;
        mainLayout = new VBox(getTopBar(), getMainPannel());
        root = new StackPane(mainLayout, getSpinner());
        root.setPadding(new Insets(40, 0, 0, 0));
        return new Scene(root, WIDTH, HEIGHT, SCENE_COLOR);
    }
}
