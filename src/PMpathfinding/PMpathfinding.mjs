import PMpathfindingDebug from "./PMpathfindingDebug.mjs";
import newVisMap from "./newVisMap.mjs";

// import testGraphHelper from "./testGraph.mjs";
import testGraphHelper from "./testGraphHelper.mjs";

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
// returns two vertices of each side of the rectangle
function* EachPoligonSide({points})
{
    // const sidePointA = new Phaser.Math.Vector2();
    // const sidePointB = new Phaser.Math.Vector2();

    // const polygonSide = new Phaser.Geom.Line()
    for (let i = 0, {length} = points, j = length - 1; i < length; j = i++)
    {   
    
      yield {sidePointA: points[i], sidePointB: points[j]};
      //.setTo(points[i].x, points[i].y), sidePointB.setTo(points[j].x, points[j].y)};

      // yield polygonSide.setTo(points[i].x, points[i].y, points[j].x, points[j].y);
    }
}

////anyAgainstAllOthers (in graph)
// returns (an array of) two points: the corrent one, and each of the remaining vertices
function* anyAgainstAllOthers(ary)
{
  // console.log("anyAgainstAllOthers arr:", ary)
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
  const jMax = ary.length;
  const iMax = jMax - 1;
  // const res = [];

  for (let i = 0; i < iMax; i++)
  {
    for (let j = i + 1; j < jMax; j++)
    {
      yield [ ary[i], ary[j] ];
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

        this.splitAmount = 5;
    }

    addPolygonalMap(aryOfNumberArys, name = "default")
    {
        const pm = new newVisMap(aryOfNumberArys);

        this.grabAllConcave(pm);

        this.polygonalMaps.set(name, pm)

        console.dir("PM", pm)

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
            //  polygonalMap.graph.set(curr, [])
            testGraphHelper.addNode(curr, polygonalMap.graph)
          }
  
        }
  
        isFirstPoly = false;
  
      }
  
    }

    *oldInLineOfSight(start, end, polygonalMap)
    {
      const {debug} = this;

      //the segment to check against any polygon side
      const ray = new Phaser.Geom.Line();
      setLineFromVectors(ray, start, end);

      //One side of current polygon
      const polygonSide = new Phaser.Geom.Line();


      for (const polygon of polygonalMap.polygons)
      {
        // console.log("Other poly", polygon)
        for (const {sidePointA, sidePointB} of EachPoligonSide(polygon))
        {
          debug.reset();
          debug.lineFromVecs(start, end, 0xfdffdf);          
          debug.lineFromVecs(sidePointA, sidePointB, 0xcadb99);

          setLineFromVectors(polygonSide, sidePointA, sidePointB)

          if (LineToLine(ray, polygonSide, this.out))
          {
            debug.alert('NOT in LoS!')
          }
          else
          {
            // debug.reset()
          }

          yield null;

          if (LineToLine(ray, polygonSide, this.out) && !this.itsNear(start, end, sidePointA, sidePointB))
          {
            //return false
          }

          const rayPoints = ray.getPoints(this.splitAmount)
          rayPoints[0] = GetMidPoint(ray)
          
          let fagain = true;
          for (const [num, poly] of polygonalMap.polygons.entries())
          {
            console.log("NPOLY", num, poly)
            for (const point of rayPoints)
            {
              const ppolyCheck = poly.contains(point.x, point.y);
              if (poly.contains(point.x, point.y) === fagain)
              {
                debug.setBackgroundColor()
                debug.setFillColor(0xbbdd89)
                debug.showVector(point)
              }
              else
              {
                debug.alert("WRONG - not IOS", true, 0xffff78)
                debug.setFillColor(0xff3445)
                debug.showVector(point)
                // debug.alert("ZZZ")
                // debug.reset()
              }
              yield null

              // console.log(`poly[${num}] -> ${ppolyCheck}, fagain ${fagain}, res: ${fagain===ppolyCheck}`);

            }
            fagain = false;
              
          }
          // explicit check
          // let first = true;
          // for (const polygon of polygonalMap.polygons)
          // {
          //   console.log(first, polygon)
          //   if (rayPoints.some(ele => polygon.contains(ele.x, ele.y) === first))
          //   {
          //     console.log(polygon.contains(e.x, e.y) === first)
          //     // return false
          //   }
          //   first = false
          // }


        }
      } //end EachPoligonSide

    } // end oldInLineOfSight

    *testGenConnectNodes(polygonalMap)
    {
      const {debug} = this;

      const ray = new Phaser.Geom.Line();

      const polygonSide = new Phaser.Geom.Line();

      // iterate each node of the visibility map graph against any other node of the graph
      // note that 'concaveA' and 'concaveB' are 'Vector2Like' objects, and NOT 'Phaser.Math.Vector2's
      for (const [concaveA, concaveB] of anyAgainstAllOthers([...polygonalMap.graph.keys()]))
      {
        // DEBUG //
        //       //
        let distStart;
        let distEnd;
        let debugLineToLineIntersection;
        let debugDistanceToSegmentA;
        let debugDistanceToSegmentB;
        let oldLoS;
        let debugFuzzyA;
        let debugFuzzyB;
        let fuzzyLoS;
        let approxA;
        let approxB;

        let inLoS = true;
        //       //
        // DEBUG //


        // given two nodes and the line connecting them (ray), check if this line intersects with any side of any polygon of the visibility map:
        setLineFromVectors(ray, concaveA, concaveB);

        //****Line-of-sight check starts here:****//
        // note that 'sidePointA' and 'sidePointB' Vec2Like Objects, NOT 'Phaser.Math.Vector2's
        for (const polygon of polygonalMap.polygons)
        {
          // console.log("Other poly", polygon)
          for (const {sidePointA, sidePointB} of EachPoligonSide(polygon))
          {
            const {points: debPoints} = polygon;
            debug.setText(`Poly ${polygonalMap.polygons.indexOf(polygon)} / ${polygonalMap.polygons.length -1}\n V1 ${debPoints.indexOf(sidePointB)} - V2 ${debPoints.indexOf(sidePointA)}\n`);
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

            debugFuzzyA = this.itsNear(concaveA, concaveB, sidePointA, sidePointB)
            
            // debug.setText(`LineToLine: ${debugLineToLineIntersection}\ndistSegA: ${debugDistanceToSegmentA}\ndistSegB: ${debugDistanceToSegmentB}`);
            // debug.setText(`distSegA: ${debugDistanceToSegmentA}\ndistSegB: ${debugDistanceToSegmentB}`);

            debug.addText(`${debugDistanceToSegmentA} ${debugDistanceToSegmentB}\n`);
            oldLoS = debugLineToLineIntersection && debugDistanceToSegmentA && debugDistanceToSegmentB;

            debug.addText(`MTEST: ${debugDistanceToSegmentA && debugDistanceToSegmentB} -> ${!debugFuzzyA}`)

            // test ok, it seems!
            // if ((debugDistanceToSegmentA && debugDistanceToSegmentB) === !debugFuzzyA)
            // {
            //   console.log("orco")
            //   debug.setBackgroundColor(0xffff75);
            // }
            // else
            // {
            //   console.log((debugDistanceToSegmentA && debugDistanceToSegmentB) === debugFuzzyA)
            //   debug.setBackgroundColor(0x45bddf);
            // }
            // yield true




            if (oldLoS)
            {
              debug.addText("\n *** NOT in LoS! ***");
              debug.setBackgroundColor(0x987634);

              // yield true
              // break;
            }
            else
            {
              debug.addText(`\n......`);
              debug.setBackgroundColor();

              // yield true
            }
            debug.addText(`\nSimp Inters: ${debugLineToLineIntersection}`);
            debug.debugText.clearTint();
            // debug.debugText.setTintFill(0x666666);
            debug.debugText.setWordTint("true", -1, true, 0x98ca98);
            // debug.debugText.setWordTint("false", -1, true, 0xac56ff);
            yield true

            
            // oldLoS = !(debugLineToLineIntersection && debugDistanceToSegmentA && debugDistanceToSegmentB);
            
            // approxA = this.tempApproxEq(concaveA, sidePointA, sidePointB);

            // approxB = this.tempApproxEq(concaveB, sidePointA, sidePointB)
            // //let testLoS = !(debugLineToLineIntersection && approx );

            // // debug.setText(`axA: ${approxA}, axB: ${approxB}\ndsA: ${debugDistanceToSegmentA}, dsB: ${debugDistanceToSegmentB}`);
            
            // debug.addText(`\nIsAdjacent: ${this.isAdjacent(concaveA, concaveB, sidePointA, sidePointB)}`);
            
            // yield debug.addText(`\nintersect: ${debugLineToLineIntersection}`);
            
            
          
          } // end EachPoligonSide loop
        } // end polygons loop
      } // end anyAgainstAllOthers loop

    } // end testGenConnectNodes

    itsNear(rayA, rayB, sideA, sideB, recycledVec = new Phaser.Math.Vector2())
    {
      // bullshit (before that we need an "inSamePoly" check):
      // let stato = "";
      // if (rayA === sideB && rayB === sideA){stato ="Same vec!"}
      // else
      // {
      //   if(rayB === sideB ||rayA === sideA || rayA === sideB || rayB === sideA){stato="Adjacent"}
      // }
      // console.log(`${stato} ra:${JSON.stringify(rayA)}, rb${JSON.stringify(rayB)}, sA${JSON.stringify(sideA)}, sB${JSON.stringify(sideB)}`)
      
      // vec.setFromObject(rayPoint);
      return (recycledVec.setFromObject(rayA, this.epsilon).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayB).fuzzyEquals(sideB, this.epsilon)) || (recycledVec.setFromObject(rayB).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayA).fuzzyEquals(sideB, this.epsilon));
    }

    isAdjacent(rayA, rayB, sidePointA, sidePointB)
    {
      //before:
      // return sidePointA.fuzzyEquals(rayA, this.epsilon) || sidePointA.fuzzyEquals(rayB, this.epsilon) || sidePointB.fuzzyEquals(rayA, this.epsilon) || sidePointB.fuzzyEquals(rayB, this.epsilon);

      // after:
      const va = new Phaser.Math.Vector2(rayA);
      const vb = new Phaser.Math.Vector2(rayB)

      console.log("va == a", va.fuzzyEquals(sidePointA, this.epsilon));
      console.log("vb == b", vb.fuzzyEquals(sidePointB, this.epsilon));

      console.log("va == b", va.fuzzyEquals(sidePointB, this.epsilon));
      console.log("vb == a", vb.fuzzyEquals(sidePointA, this.epsilon));

      return !va.fuzzyEquals(sidePointA, this.epsilon && !vb.fuzzyEquals(sidePointB, this.epsilon)) || (!va.fuzzyEquals(sidePointB, this.epsilon) && !vb.fuzzyEquals(sidePointA, this.epsilon));

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
