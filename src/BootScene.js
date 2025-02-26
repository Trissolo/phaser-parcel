import Phaser from 'phaser';
// import fontbia from './assets/font_bianco.png';
// import xmlfontbia from './assets/font_bianco.xml';

export default class BootScene extends Phaser.Scene {
  constructor () {
    super({ key: 'boot' });
  }

  preload () {
    const bg = this.add.rectangle(400, 300, 400, 30, 0x666666);
    const bar = this.add.rectangle(bg.x, bg.y, bg.width, bg.height, 0xffffff).setScale(0, 1);

    console.table(images);

    this.load.image('space', images.space);
    this.load.image('logo', images.logo);
    this.load.image('red', images.red);

    this.load.on('progress', function (progress) {
      bar.setScale(progress, 1);
    });
  }

  update () {
    this.scene.start('menu');
    // this.scene.start('play');
    // this.scene.remove();
  }
}
