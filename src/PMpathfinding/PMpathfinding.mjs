import PMpathfindingDebug from "./PMpathfindingDebug.mjs";
import newVisMap from "./newVisMap.mjs";

//generators:

// ex: ary = ['A', 'B', 'C', 'D', 'E'];
// result {prec, curr, succ}:
// EAB,
// ABC,
// BCD,
// CDE,
// DEA
function* EachVectorAndAdjacents(ary)
{
  const len = ary.length - 1;
  let i = 0, j = len;
  
  for( ; i < len; j = i++)
  {
    yield { curr: ary[i], succ: ary[i + 1], prec: ary[j] };
  }
  
  yield { curr: ary[i], succ: ary[0], prec: ary[j] };
};


///
// pass in a polygon
// returns a new Phaser.Geom.Line
function* EachPoligonSide({points})
{
    const polygonSide = new Phaser.Geom.Line()
    for (let i = 0, {length} = points, j = length - 1; i < length; j = i++)
    {     
      // console.log(i, j);
      // yield graphics.lineBetween(points[i].x, points[i].y, points[j].x, points[j].y);
      yield polygonSide.setTo(points[i].x, points[i].y, points[j].x, points[j].y);
    }
}

////anyAgainstAllOthers (in graph)
// returns concaveA: current point, concaveB: any other point;
function* anyAgainstAllOthers(ary)
{
  console.log("anyAgainstAllOthers arr:", ary)
  // const {length} = ary;
  // const lenMinusOne = ary.length - 1;
  // let currentNodeIdx, anyOtherNodeIdx;
  // for( currentNodeIdx = 0; currentNodeIdx < lenMinusOne; currentNodeIdx++)
  //     {
  //       console.log("anyAgainstAllOthers STARTED!", currentNodeIdx);

  //       for(anyOtherNodeIdx = currentNodeIdx + 1; anyOtherNodeIdx < length; anyOtherNodeIdx++);
  //       {
  //         console.log("anyAgainstAllOthers SEC!", anyOtherNodeIdx);
  //         yield {concaveA: ary[currentNodeIdx], concaveB: ary[anyOtherNodeIdx]};//, idxA: currentNodeIdx, idxB: anyOtherNodeIdx};
  //       }
  //     }
  for (let i = 0, len = ary.length; i < len; i++)
  {
    for (let j = i + 1; j < len; j++)
    {
      yield {concaveA: ary[i], concaveB: ary[j]};
    }
  }
};

export default class PMpathfinding
{
    // debug = null;

    constructor(scene, enableDebug = true)
    {
        this.scene = scene;

        this.polygonalMaps = new Map()

        if (enableDebug)
        {
            this.debug = new PMpathfindingDebug(this)
        }

        //for recycle
        this.vertexA = new Phaser.Math.Vector2();

        this.vertexB = new Phaser.Math.Vector2();

        this.out = new Phaser.Math.Vector2();

        this.epsilon = 0.5;
    }

    addPolygonalMap(aryOfNumberArys, name = "default")
    {
        const pm = new newVisMap(aryOfNumberArys);

        this.grabAllConcave(pm);

        this.polygonalMaps.set(name, pm)

        console.dir(pm)

        return pm
    }

    getPolygonalMap(name = 'default')
    {
        return this.polygonalMaps.get(name)
    }

    grabAllConcave(polygonalMap)
    {
      const {vertexA, vertexB} = this;

      let isFirstPoly = true;

      //iterate allwalkable poly
      for (const polygon of polygonalMap.polygons)
      {
        //iterate all vertices in each poly
        for(const {curr, succ, prec} of EachVectorAndAdjacents(polygon.points))
        {

          vertexA.copy(succ).subtract(curr);
          vertexB.copy(curr).subtract(prec);
  
          if( (vertexB.cross(vertexA) < 0) === isFirstPoly)
          {
            polygonalMap.graph.set(curr, [])
          }
  
        }
  
        isFirstPoly = false;
  
      }
  
    }

    *testGenConnectNodes(polygonalMap)
    {
      const ray = new Phaser.Geom.Line();
      //console.log("KEyS", ary);
      for (const {concaveA, concaveB} of anyAgainstAllOthers([...polygonalMap.graph.keys()]))
      {
        // basically, the old inLineOfS...
        ray.setTo(concaveA.x, concaveA.y, concaveB.x, concaveB.y);

        //// DEBUG ////
        this.debug.lineFromVecs(concaveA, concaveB);
        let debuVar, distStart, distEnd, ilof;

        for (const polygon of polygonalMap.polygons)
        {
          // console.log("Other poly", polygon)
          for (const polygonSide of EachPoligonSide(polygon))
          {
            //// DEBUG ////
            this.scene.cameras.main.setBackgroundColor()
            this.debug.graphics.clear()

            this.debug.lineFromVecs(polygonSide.getPointA(), polygonSide.getPointB(), 0xa3ce27);
            this.debug.lineFromVecs(concaveA, concaveB, 0xffffff);

            debuVar = Phaser.Geom.Intersects.LineToLine(ray, polygonSide, this.out)

            distStart = this.distanceToSegment(polygonSide, concaveA);
            distEnd = this.distanceToSegment(polygonSide, concaveB);

            this.compareWays(distStart, distEnd, polygonSide, ray)

            if (debuVar)
            {
              this.debug.debugText.setText("Intersection!")
              // this.debug.lineFromVecs(polygonSide.getPointA(), polygonSide.getPointB(), 0xeb8931);
              // this.debug.lineFromVecs(concaveA, concaveB, 0xacced2);
            }
            else
            {
              this.debug.debugText.setText("NO Intersection!")
            }
            
            this.debug.debugText.text+=`\ndistStart: ${distStart}\ndistEnd: ${distEnd}`;

            //quibus:
            ilof = !(debuVar && (distStart > 0.5) && (distEnd > 0.5));

            if (!ilof)
            {
              this.scene.cameras.main.setBackgroundColor(0xbe2633)
              this.debug.lineFromVecs(polygonSide.getPointA(), polygonSide.getPointB(), 0xeb8931);
              this.debug.lineFromVecs(concaveA, concaveB, 0xacced2);
            }

            // yield this.debug.debugText.text+= `\nin line of sight= ${ilof}\n`+ this.compareWays(distStart, distEnd, polygonSide, ray)
            // yield this.debug.debugText.text = this.compareWays(distStart, distEnd, polygonSide, ray)

          }
        }
        // this.testGeninLineOfSight(null, null, polygonalMap)
      }
    }

    compareWays(distStart, distEnd, polygonSide, ray)
    {
      const epsilon = 0.5;
      const testEpsilon = 0.03;

      // const distStartText = `distStart > 0.5 ${distStart > epsilon}`;
      // const distEndText = `distEnd > 0.5 ${distEnd > epsilon}`;

      const pointA = ray.getPointA();
      const pointB = ray.getPointB();
      const sideA = polygonSide.getPointA();
      const sideB = polygonSide.getPointB();
      // const fuzzyA = `pointA fuzzy:\n${pointA.fuzzyEquals(sideA, epsilon)},\n${pointA.fuzzyEquals(sideB, epsilon)}`;// , ${distStart}`;
      // const fuzzyB = `pointB fuzzy:\n${pointB.fuzzyEquals(sideA, epsilon)},\n${pointB.fuzzyEquals(sideB, epsilon)}`;//, ${distEnd}`;

      const sintA = (pointA.fuzzyEquals(sideA, testEpsilon)) || (pointA.fuzzyEquals(sideB, testEpsilon));
      const sintB = (pointB.fuzzyEquals(sideA, testEpsilon)) || (pointB.fuzzyEquals(sideB, testEpsilon));

      const oldWay = (distStart <= epsilon) || (distEnd <= epsilon);
      const newWay = sintA || sintB;
      oldWay === newWay? true : console.log("***false".repeat(11))
      // return `${fuzzyA}\n${fuzzyB}\n${distStartText}, ${distEndText}`
      return `Same Result: ${oldWay === newWay? ":)" : "****NO!****"}\nOLD: ${oldWay}\nNEW: ${newWay}`


    }

    distanceToSegment(line, vec)
    { 
      const out = new Phaser.Math.Vector2()
      Phaser.Geom.Line.GetNearestPoint(line, vec, out)
  
      // const xMin = Math.min(line.x1, line.x2)
      // const xMax = Math.max(line.x1, line.x2)
      // const yMin = Math.min(line.y1, line.y2)
      // const yMax = Math.max(line.y1, line.y2)
  
      // if(out.x > xMax) { out.x = xMax }
      // else if(out.x < xMin) { out.x = xMin }

      // if(out.y > yMax) { out.y = yMax }
      // else if(out.y < yMin) { out.y = yMin }
  
      //
      // out.set( Phaser.Math.Clamp(out.x, Math.min(line.x1, line.x2), Math.max(line.x1, line.x2)),
      //          Phaser.Math.Clamp(out.y, Math.min(line.y1, line.y2), Math.max(line.y1, line.y2))
      // );
      out.set(Phaser.Math.Clamp(out.x, Math.min(line.x1, line.x2), Math.max(line.x1, line.x2)),
              Phaser.Math.Clamp(out.y, Math.min(line.y1, line.y2), Math.max(line.y1, line.y2))
              );

      return out.distance(vec)
  
    } //end distanceToSegment

    testGeninLineOfSight(start, end, polygonalMap)
    {
      for (const polygon of polygonalMap.polygons)
      {
        console.log("inLineOfSight", polygon)
      }
    }
}  // end class newPMStroll
