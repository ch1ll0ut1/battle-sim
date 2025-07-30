import { Screen } from '../../../Engine/Screen';
import { Button } from '../../components/Button/Button';
import { Label } from '../../components/Label/Label';
import { MapScreen } from '../MapScreen/MapScreen';

/**
 * MenuScreen displays the main menu title and handles menu layout.
 * Inherits animation and lifecycle from the Screen base class.
 */
export class MenuScreen extends Screen {
    private titleText: Label;
    private menuButtons: Button[];

    /**
     * Constructs the MenuScreen, initializing the title text.
     */
    constructor() {
        super();

        this.titleText = new Label('title', 'Menu');
        this.addChild(this.titleText);

        this.menuButtons = [
            new Button({
                type: 'primary',
                label: 'Play',
                onClick: () => {
                    console.log('Play button clicked');
                    void this.screenManager.show(MapScreen);
                },
            }),
            new Button({
                type: 'primary',
                label: 'Map Editor',
                onClick: () => {
                    console.log('Map Editor button clicked');
                    // this.screenManager.show(MapEditorScreen);
                },
            }),
        ];

        // this.menuButtons[0].setEnabled(false);

        this.menuButtons.forEach((button) => {
            this.addChild(button);
        });
    }

    /**
     * Resize the menu screen and reposition the title text.
     * @param width - New width of the screen.
     * @param height - New height of the screen.
     */
    resize(width: number, height: number): void {
        console.log('MenuScreen resize', width, height);
        const titleTopTop = 150;
        const titleGapToButtons = 100;
        const buttonGap = 20;

        this.titleText.position.set(width * 0.5, titleTopTop);

        this.menuButtons.forEach((button, index) => {
            button.position.set(
                width * 0.5,
                titleTopTop + titleGapToButtons + this.titleText.height + (button.height + buttonGap) * index,
            );
        });
    }
}
