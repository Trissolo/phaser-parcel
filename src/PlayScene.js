import Phaser from 'phaser';
import fontbia from './assets/font_bianco.png';
import xmlfontbia from './assets/font_bianco.xml';

import gimpPolys from './PMpathfinding/gimpPolys.mjs';
import PMpathfinding from './PMpathfinding/PMpathfinding.mjs';


//testing PQ
import PriorityQueue from './PMpathfinding/pfalgorithms/PriorityQueue.mjs';

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
    this.player = this.add.triangle(224, 92, 4, 16, 0, 0, 8, 0, 0x88bb88)//0xdb78ca)
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

    // this.gag = this.pmStroll.oldInLineOfSight(this.player, this.dest, this.polyMap);

    // this.gag = this.pmStroll.testGenConnectNodes(this.polyMap);
    
    //next two lines temporarily commented out
    // this.gag = this.pmStroll.drawPolyMap(this.polyMap)
    // this.input.keyboard.on("keydown-Z", () => {this.gag.next()});

    //test pq
    const refAry = [
      {x: 0, y: 0},
      {x: 1, y: 1},
      {x: 2, y: 2},
      {x: 3, y: 3},
      {x: 4, y: 4}
    ];
    
    const testMap = new Map([
        [refAry[0], 0],
        [refAry[1], 10],
        [refAry[2], 20],
        [refAry[3], 30],
        [refAry[4], 40]
      ]);

      console.dir(testMap);
      console.log("%c First insertion! ", "background-color: #A33");
      const testPq = new PriorityQueue(testMap)

      testPq.insert( refAry[3]);

      console.log(testPq.orderedArr, testPq.distancesMap);

      testPq.insert( refAry[2] );
      testPq.insert( refAry[4] );
      testPq.insert( refAry[1] );

      console.log("%cRESULTING PQ:", "background-color: #999")
      console.dir(testPq.orderedArr);


    
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
