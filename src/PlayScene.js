import Phaser from 'phaser';
import fontbia from './assets/font_bianco.png';
import xmlfontbia from './assets/font_bianco.xml';

import gimpPolys from './PMpathfinding/gimpPolys.mjs';
import PMpathfinding from './PMpathfinding/PMpathfinding.mjs';

export default class PlayScene extends Phaser.Scene {
  constructor ()
  {
    super({key: 'play'});
  }

  preload()
  {
    this.load.bitmapFont('bianco', fontbia, xmlfontbia);//'font_bianco.png', 'font_bianco.xml');
  }

  create ()
  {
    this.player = this.add.triangle(80, 32, 4, 16, 0, 0, 8, 0, 0x88bb88)//0xdb78ca)
        .setOrigin(0.5, 1)
        .setDepth(2);

        // a circle, just to visualize the end point
    this.dest = this.add.circle(40, 90, 2, 0xea5d7c).setDepth(2);

    this.input.on('pointerdown', this.placeThings, this);

    this.pmStroll = new PMpathfinding(this, true);

    this.pmStroll.addPolygonalMap(gimpPolys[0].coords);

    this.polyMap = this.pmStroll.getPolygonalMap('default');

    this.pmStroll.debug.showAsImage(this.polyMap);

    console.log(this.polyMap);

    console.log("Exec testGenConnectNodes:");

    // for (const por of this.pmStroll.testGenConnectNodes(this.polyMap))
    // {
    //   console.log("por",por)
    // }
    // this.pmStroll.debug.lineFromVecs(this.polyMap.polygons[0].points[0], this.polyMap.polygons[1].points[1])

    this.gag = this.pmStroll.oldInLineOfSight(this.player, this.dest, this.polyMap);

    //  this.gag = this.pmStroll.testGenConnectNodes(this.polyMap);
     

     this.input.keyboard.on("keydown-Z", () => {this.gag.next()});

    
  }  // end create

  placeThings(pointer)
  {
    if (pointer.middleButtonDown())
    {
      this.player.setPosition(pointer.worldX, pointer.worldY);
    }

    else 
    {
      if (pointer.rightButtonDown())
      {

        this.dest.setPosition(pointer.worldX, pointer.worldY);
      }
    }
  }

  // update () {}
}
