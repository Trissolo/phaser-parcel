import Phaser from 'phaser';
// import BootScene from './BootScene';
import PlayScene from './PlayScene';
// import MenuScene from './MenuScene';
// import EndScene from './EndScene';

// export default {
//   type: Phaser.AUTO,
//   width: 400,
//   height: 300,
//   title: 'Phaser 3 with Parcel 📦',
//   url: 'https://github.com/samme/phaser-parcel',
//   banner: { text: 'white', background: ['#FD7400', '#FFE11A', '#BEDB39', '#1F8A70', '#004358'] },
//   scene: [BootScene, MenuScene, PlayScene, EndScene]
// };

export default {
  type: Phaser.WEBGL,
  pixelArt: true,
  backgroundColor: '#232323', //'#320822',
  disableContextMenu: true,
  scale:
  {
    mode: Phaser.Scale.NONE,
    //autoCenter: Phaser.Scale.CENTER_BOTH,
    
    width: 256,
    height: 128,
    zoom: 3
    
    //width:600, height:400, zoom:2
  },
  
  // loader:
  // {
  //   baseURL: 'https://gist.githubusercontent.com/Trissolo/0135ed23866b2134016e566365718f60/raw/63e4e9132d75240701b2d54c8e07b1444805cce6',
  //   crossOrigin: 'anonymous'
  // },
  
    
  scene: [PlayScene]//SceneA, SceneBnuo]
};
