import PMpathfindingDebug from "./PMpathfindingDebug.mjs";
import newVisMap from "./newVisMap.mjs";

import AStar from "./pfalgorithms/astar.mjs";

// import testGraphHelper from "./testGraph.mjs";
import testGraphHelper from "./testGraphHelper.mjs";

//helpers
import setLineFromVectors from "./setLineFromVectors.mjs";

const {BetweenPoints: heuristic} = Phaser.Math.Distance
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
    for (let i = 0, {length} = points, j = length - 1; i < length; j = i++)
    {      
      yield {sidePointA: points[i], sidePointB: points[j]};
    }
}

////anyAgainstAllOthers (in graph)
// returns (an array of) two points: the corrent one, and each of the remaining vertices
function* anyAgainstAllOthers(ary)
{
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

} // end anyAgainstAllOthers

// class!
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

      this.checkAdjacent(pm);


      this.quickConnConc(pm);


      this.polygonalMaps.set(name, pm)

      console.dir("PM", pm)

      // this.drawPolyMap(pm)

      return pm
    }

    getPolygonalMap(name = 'default')
    {
      return this.polygonalMaps.get(name)
    }

    *drawPolyMap(polygonalMap)
    {
      // const clone = testGraphHelper.cloneGraph(polygonalMap.graph);
      // console.log("drawPolyMap -CLONE-:")
      for(const [node, neighborContainer] of polygonalMap)
      {

        this.debug.graphics.clear();
        this.debug.graphics.fillCircle(node.x, node.y, 3); //showVector(node)
        // console.log(node, polygonalMap.graph.get(node).size)
        yield null

        for (const [neighbor, dist] of neighborContainer)
        {
          // console.log(neighborContainer === polygonalMap.graph.get(node), "clone size:", neighborContainer.size)
          this.debug.lineFromVecs(node, neighbor, 0xffffca)// Phaser.Math.Between(0x9aff00, 0xffff9a))
          yield null
        }
      }
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

        // from now isFirstPoly must be false!
        isFirstPoly = false;
  
      }
  
    } // end grabAllConcave

    checkAdjacent(polygonalMap) // (old)
    {
      // const {polygons} = polygonalMap
      const {graph} = polygonalMap;

      for (const polygon of polygonalMap.polygons)
      {
        // EachPoligonSide
        for (const {sidePointA, sidePointB} of EachPoligonSide(polygon))
        {
          if (graph.has(sidePointA) && graph.has(sidePointB))
          {
            testGraphHelper.addEdge(sidePointA, sidePointB, heuristic(sidePointA, sidePointB), graph)
          }
        }
      }
    } // end (old) checkAdjacent

    quickConnConc(polygonalMap, graph = polygonalMap.graph)
    {
      for (const [concaveA, concaveB] of anyAgainstAllOthers([...graph.keys()]))
      {
        if (this.quickInLineOfSight(concaveA, concaveB, polygonalMap))
        {
          testGraphHelper.addEdge(concaveA, concaveB, heuristic(concaveA, concaveB), graph)
        }
      }
    }

    quickInLineOfSight(start, end, polygonalMap)
    {
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
          setLineFromVectors(polygonSide, sidePointA, sidePointB);

          if (LineToLine(ray, polygonSide, this.out) && !this.itsNear(start, end, sidePointA, sidePointB))
          {
            return false
          }
        }
      }

      //another loop?
      const rayPoints = ray.getPoints(this.splitAmount)
      rayPoints[0] = GetMidPoint(ray)
      
      let fagain = false;
      for (const poly of polygonalMap.polygons)//.entries())
      {
        if (rayPoints.some((point, idx, ary) => poly.contains(point.x, point.y) === fagain))
        {
          return false
        }
        fagain = true
      }

      return true

    } // end quickInLineOfSight

    addExtraNodeToClonedGraph(extraNode, clonedGraph, graphKeys, limit, originalPolygonalMap)
    {
      testGraphHelper.addNode(extraNode, clonedGraph);

      for (let i = 0; i < limit; i++)
      {
        const node = graphKeys[i];

        if (this.quickInLineOfSight(extraNode, node, originalPolygonalMap))
        {
          testGraphHelper.addEdge(extraNode, node, heuristic(extraNode, node), clonedGraph);
        }
      }

      //just in case...
      return clonedGraph
    }

    newPrepareGraph(start, end, polygonalMap)
    {
      // 1) Clone the Graph:
      const clonedGraph = testGraphHelper.cloneGraph(polygonalMap.graph);

      // console.log("Current clonedGraph size", clonedGraph.size)

      // 2) Extract the Keys (extract the keys, which are used to create the edges of the new node):
      const graphKeys = [...clonedGraph.keys()];

      // 3) the highest node index - when creating edges you don't need to go further
      let {length} = graphKeys;

      // 4) Add and connect the new Node
      this.addExtraNodeToClonedGraph(start, clonedGraph, graphKeys, length, polygonalMap);

      // console.log("Current clonedGraph size after:", clonedGraph.size);

      // 5) Before add the second new node update the Keys and 'length'
      graphKeys.push(start);

      //6) 'length'
      length += 1;

      // 7) Add the 'end' node
      this.addExtraNodeToClonedGraph(end, clonedGraph, graphKeys, length, polygonalMap);

      // console.log("Current clonedGraph size after adding the second node:", clonedGraph.size);

      //done!
      return clonedGraph
    }


    prepareGraph(start, end, polygonalMap)
    {
      const clone = testGraphHelper.cloneGraph(polygonalMap.graph);

      testGraphHelper.addNode(start, clone);
      const tempKeysFirstTime = [...clone.keys()]

      // for (const node of clone.keys())
      for (let i = 0; i < tempKeysFirstTime.length - 1; i++)
      {
        const node = tempKeysFirstTime[i];
        // console.log("Iterating clone keys!", node);
        if (this.quickInLineOfSight(start, node, polygonalMap))
        {
          testGraphHelper.addEdge(start, node, heuristic(start, node), clone)
        }
      }

      testGraphHelper.addNode(end, clone);
      tempKeysFirstTime.push(end);

      for (let i = 0; i < tempKeysFirstTime.length - 1; i++)
      {
        const node = tempKeysFirstTime[i];
        // console.log("Iterating clone keys!", node);
        if (this.quickInLineOfSight(end, node, polygonalMap))
        {
          testGraphHelper.addEdge(end, node, heuristic(end, node), clone)
        }
      }

      //temp! the clone must be returned!
      this.debug.showGraph(clone);


      const finder = new AStar(start, end, clone, this.debug);
      console.log("Finder:", finder)
      // console.log("Finder:", finder.getPath())
      return finder




      // testGraphHelper.addNode(end, clone);
      // for (const node of clone.keys())
      // {
      //   // console.log("Iterating clone keys!", node);
      //   if (this.quickInLineOfSight(end, node, polygonalMap))
      //   {
      //     testGraphHelper.addEdge(end, node, heuristic(end, node), clone)
      //   }
      // }

      // console.log("Sizes", clone.size, polygonalMap.graph.size, "imp:", tempKeysFirstTime.length, tempKeysFirstTime);

      // return clone
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
