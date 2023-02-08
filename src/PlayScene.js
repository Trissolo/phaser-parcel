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
    // this.add.image(400, 300, 'space');

    // this.add.bitmapText(10, 10, 'bianco', 'Test!').setDepth(Number.MAX_SAFE_INTEGER)

    this.pmStroll = new PMpathfinding(this, true)

    this.pmStroll.addPolygonalMap(gimpPolys[0].coords)

    this.polyMap = this.pmStroll.getPolygonalMap('default')

    this.pmStroll.debug.showAsImage(this.polyMap)

    console.log(this.polyMap)

    console.log("Exec testGenConnectNodes:")

    // for (const por of this.pmStroll.testGenConnectNodes(this.polyMap))
    // {
    //   console.log("por",por)
    // }
    // this.pmStroll.debug.lineFromVecs(this.polyMap.polygons[0].points[0], this.polyMap.polygons[1].points[1])
     this.gag = this.pmStroll.testGenConnectNodes(this.polyMap);

     this.input.keyboard.on("keydown-Z", () => {this.gag.next()})



    // const pa = new Phaser.Geom.Polygon(gimpPolys[0].coords[0])
    // const ob = new Phaser.Geom.Polygon(gimpPolys[0].coords[1])

    // const gr = this.add.graphics()

    // gr.fillStyle(0x675, 1);
    // gr.fillPoints(pa.points)

    // gr.fillStyle(0x432675, 1);
    // gr.fillPoints(ob.points)
    
  }  // end create

  // update () {}
}
