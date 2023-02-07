import PMpathfindingDebug from "./PMpathfindingDebug.mjs";
import newVisMap from "./newVisMap.mjs";

//helpers
import setLineFromVectors from "./setLineFromVectors.mjs";

const {BetweenPoints} = Phaser.Math.Distance
// const {Polygon, Line} = Phaser.Geom
const {GetMidPoint, GetNearestPoint} = Phaser.Geom.Line
const {LineToLine} = Phaser.Geom.Intersects

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
    const sidePointA = new Phaser.Math.Vector2();
    const sidePointB = new Phaser.Math.Vector2();

    // const polygonSide = new Phaser.Geom.Line()
    for (let i = 0, {length} = points, j = length - 1; i < length; j = i++)
    {   
    
      yield {sidePointA: sidePointA.setTo(points[i].x, points[i].y), sidePointB: sidePointB.setTo(points[j].x, points[j].y)};
      //.setTo(points[i].x, points[i].y), sidePointB.setTo(points[j].x, points[j].y)};

      // yield polygonSide.setTo(points[i].x, points[i].y, points[j].x, points[j].y);
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
}

// setLineFromVectors(line, va, vb)
// {
//   return line.setTo(va.x, va.y, vb.x, vb.y)
// }

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

        this.oldEpsilon = 0.5;

        this.epsilon = 0.03;
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
      const {debug} = this;

      const ray = new Phaser.Geom.Line();

      const polygonSide = new Phaser.Geom.Line();

      // iterate each node of the visibility map graph against any other node of the graph
      // note that 'concaveA' and 'concaveB' are 'Vector2Like' objects, and NOT 'Phaser.Math.Vector2's
      for (const {concaveA, concaveB} of anyAgainstAllOthers([...polygonalMap.graph.keys()]))
      {
        // DEBUG //
        //       //
        let distStart, distEnd;
        let debugLineToLineIntersection, debugDistanceToSegmentA, debugDistanceToSegmentB, oldLoS, approxA, approxB;
        //       //
        // DEBUG //


        // given two nodes and the line connecting them (ray), check if this line intersects with any side of any polygon of the visibility map:
        setLineFromVectors(ray, concaveA, concaveB);

        //****Line-of-sight check starts here:****//
        // note that 'sidePointA' and 'sidePointB' ARE 'Phaser.Math.Vector2's
        for (const polygon of polygonalMap.polygons)
        {
          // console.log("Other poly", polygon)
          for (const {sidePointA, sidePointB} of EachPoligonSide(polygon))
          {
            // polygonSide.setTo(sidePointA.x, sidePointA.y, sidePointB.x, sidePointB.y);
            setLineFromVectors(polygonSide, sidePointA, sidePointB);

            //// DEBUG ////
            debug.setBackgroundColor()
            debug.graphics.clear()
                     
            debug.lineFromVecs(concaveA, concaveB, 0xfdffdf);
            
            debug.lineFromVecs(sidePointA, sidePointB, 0xcadb99);
            

            debugLineToLineIntersection = LineToLine(ray, polygonSide, this.out);
            
            debugDistanceToSegmentA = this.distanceToSegment(polygonSide, concaveA) > 0.5;
            debugDistanceToSegmentB = this.distanceToSegment(polygonSide, concaveB) > 0.5;
            
            // debug.setText(`LineToLine: ${debugLineToLineIntersection}\ndistSegA: ${debugDistanceToSegmentA}\ndistSegB: ${debugDistanceToSegmentB}`);

            // oldLoS = !(debugLineToLineIntersection && debugDistanceToSegmentA && debugDistanceToSegmentB);
            
            approxA = this.tempApproxEq(concaveA, sidePointA, sidePointB);

            approxB = this.tempApproxEq(concaveB, sidePointA, sidePointB)
            //let testLoS = !(debugLineToLineIntersection && approx );

            debug.setText(`axA: ${approxA}, axB: ${approxB}\ndsA: ${debugDistanceToSegmentA}, dsB: ${debugDistanceToSegmentB}`);
            
            debug.addText(`\nIsAdjacent: ${this.isAdjacent(concaveA, concaveB, sidePointA, sidePointB)}`);
            
            yield debug.addText(`\nintersect: ${debugLineToLineIntersection}`);
            
            
          
          } // end EachPoligonSide loop
        } // end polygons loop
      } // end anyAgainstAllOthers loop

    } // end testGenConnectNodes

    isAdjacent(rayA, rayB, sidePointA, sidePointB)
    {
      return sidePointA.fuzzyEquals(rayA, this.epsilon) || sidePointA.fuzzyEquals(rayB, this.epsilon) || sidePointB.fuzzyEquals(rayA, this.epsilon) || sidePointB.fuzzyEquals(rayB, this.epsilon);
    }

    // approximately equal
    tempApproxEq(concave, sidePointA, sidePointB)
    {
      const vec = new Phaser.Math.Vector2(concave);

      return !vec.fuzzyEquals(sidePointA) && !vec.fuzzyEquals(sidePointB)
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
      
      // return `Same Result: ${oldWay === newWay? ":)" : "****NO!****"}\nOLD: ${oldWay}\nNEW: ${newWay}`

      // return `Same Result: ${oldWay === newWay? ":)" : "****NO!****"}\nOLD: ${oldWay}\nNEW: ${newWay}`

      this.debug.debugText.text += `Same Result: ${oldWay === newWay}`;

      return newWay
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

}  // end class newPMStroll
