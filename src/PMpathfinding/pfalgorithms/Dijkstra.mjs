import Phaser from "phaser";
import testGraphHelper from "../testGraphHelper.mjs";
import PriorityQueue from "./PriorityQueue.mjs";

export default class Dijkstra
{
    constructor(start, target, graph, debug)
	{
		this.start = start;

		this.target = target;
		
		this.graph = graph;
        
		// this.heuristic = heuristic;


		// key
		this.cameFrom = new Map();
		//this.cameFrom.set()


		//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
		// gScore === costSoFar
		// key: node, value: dist

		this.costSoFar = new Map([...graph.keys()].map(el => [el, 0]));	

		// //populate costSoFar
        // for (const node of graph.keys())
        // {
        //     this.costSoFar.set(node, 0);
        // };

		this.costSoFar.set(start, 0);

		this.frontier = new PriorityQueue(this.costSoFar);
		
		this.search()
	}	
	
	search()
	{
		const {frontier, costSoFar, cameFrom, heuristic, start, target, graph} = this;
		
		frontier.insert(start);
		cameFrom.set(start, null)

		// costSoFar.set(start, 0);

        while(!frontier.isEmpty() )
		{
			console.log(frontier.show());
			const currentNode = frontier.pop();

			// console.log("%cAdvanc:", "background-color: #589");

			if (currentNode === target) {console.log("DJIK B R E A K I N G"); return this };//.getPath() };

            // for (const [neighbor, distance] of graph.get(currentNode))
            // {
            //     // https://www.redblobgames.com/pathfinding/posts/reprioritize.html
            //     const newCost = costSoFar.get(currentNode) + distance;

            //     if (!costSoFar.has(neighbor))
            //     {
            //         costSoFar.set(neighbor, newCost);
            //         cameFrom.set(neighbor, currentNode);
            //         frontier.insert(neighbor);
            //     }
            // }
			for (const [neighbor, distance] of graph.get(currentNode))
			{
				// console.log("\n\nCurrNode: %o\n\nActualNeig %o", currentNode, neighbor)
					const newCost = costSoFar.get(currentNode) + distance;
					const betterCost = newCost < costSoFar.get(neighbor);
                    // console.log("prec dist %o | dist %o | newCost %o", costSoFar.get(currentNode), distance, newCost)
					// console.log("%o NEICOS | %o neig: %o", betterCost, costSoFar.get(neighbor), neighbor)


					if(!cameFrom.has(neighbor) || betterCost)
					{
                        // console.log()
						costSoFar.set(neighbor, newCost);

						cameFrom.set(neighbor, currentNode);

						betterCost? frontier.reorderUpFrom(neighbor) : frontier.insert(neighbor)
					}
			} // end for...of loop

        } // end while

    } //end Search

	getPath()
	{
		const path = [];
		
		let {target} = this;
		// console.log(this.cameFrom, this.cameFrom.size, target)

		// if (!this.cameFrom.has(target) || !this.cameFrom.size)
		if (!this.cameFrom.has(target) || this.cameFrom.size === 1)
		{
			this.destroy(); return path
		}
		
		path.push(target);


		while (target !== this.start)
		{
			target = this.cameFrom.get(target);

			// path.push(target);

			//new obj?
			path.push({x: target.x, y: target.y});
		}

		this.destroy();

		return path
	}

	destroy()
	{
		// console.log("Destroying Finder", ...this.graph.get(this.start).keys())

		// this.fScore.clear();
		// this.fScore = undefined;

		this.frontier.orderedArr.length = 0;
		this.frontier.orderedArr = undefined;
		this.frontier.distancesMap = undefined;
		this.frontier = undefined;

		this.costSoFar.clear();
		this.costSoFar = undefined;

		this.cameFrom.clear();
		this.cameFrom = undefined;

		this.heuristic = undefined;
		this.start = undefined;
		this.target = undefined;

		testGraphHelper.destroyGraph(this.graph);
		this.graph = undefined;

		// console.log("Finder destr", this)
	}
}
