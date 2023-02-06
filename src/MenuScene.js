import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor () {
    super({ key: 'menu' });
  }

  create () {
    this.add.image(40, 30, 'space');

    this.add.text(40, 20, 'Phaser 3 with Parcel\n\n< play >', {
      align: 'center',
      fill: 'white',
      fontFamily: 'sans-serif',
      fontSize: 24
    })
      .setOrigin(0.5, 0);

    this.input.on('pointerdown', function () {
      this.scene.switch('play');
    }, this);
  }
}
