export default class newVisMap
{
    constructor(aryOfNumberArys)
    {
        this.graph = new Map();
        
        this.polygons = [];

        for (const numbersAry of aryOfNumberArys)
        {
            this.polygons.push(new Phaser.Geom.Polygon(numbersAry));
        }
    }
}