import Phaser from "phaser";

import testGraphHelper from "./testGraphHelper.mjs";
import PriorityQueue from "./pfalgorithms/PriorityQueue.mjs";

export default class AStarOher
{
    constructor(start, target, graph, debug, heuristic = Phaser.Math.Distance.BetweenPoints)
	{
		this.start = start;

		this.target = target;
		
		this.graph = graph;
        
		this.heuristic = heuristic;


		// key node, value: the node immediately preceding it on the cheapest path from start
		// to n currently known.
		this.cameFrom = new Map();

		//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
		// gScore === costSoFar
		// key: node, value: number (distance)
		this.gScore = new Map();

		// For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
		// how short a path from start to finish can be if it goes through n.
		// key: node, value: dist
		
		this.fScore = new Map();


		//populate gScore (aka costSoFar)
		const {MAX_SAFE_INTEGER} = Number;
        for (const node of graph.keys())
        {
            this.gScore.set(node, MAX_SAFE_INTEGER);
			this.fScore.set(node, MAX_SAFE_INTEGER);
        };


		this.openSet = new PriorityQueue(this.fScore);
		
		this.search()
	}	
	
	search()
	{
		const {openSet, gScore, cameFrom, fScore, heuristic, start, target, graph} = this;
		
		gScore.set(start, 0);
		
		fScore.set(start, 0);
		
		openSet.insert(start);

        while(!openSet.isEmpty() )
		{
			const currentNode = openSet.pop();

			// console.log("%cAdvanc:", "background-color: #589");

			if (currentNode === target) { return this };//.getPath() };


			for (const [neighbor, distance] of graph.get(currentNode))
			{
				// console.log("---", gScore.get(neighbor), cameFrom.size)
				// console.log("FScore:", openSet.show())
				// BEFORE:
				// const tentative_gScore = gScore.get(currentNode) + distance;

				// After:
				const tentative_gScore = gScore.get(currentNode) + distance;

				const betterCost = tentative_gScore < gScore.get(neighbor);

				console.log("---", betterCost, gScore.get(neighbor), cameFrom.size)

				if(!cameFrom.has(neighbor))// || betterCost)
				{
					cameFrom.set(neighbor, currentNode);

					gScore.set(neighbor, tentative_gScore);

					fScore.set(neighbor, tentative_gScore + heuristic(neighbor, target));
					
					openSet.insert(neighbor);
				}
				else if (betterCost)
				{
					gScore.set(neighbor, tentative_gScore);

					fScore.set(neighbor, tentative_gScore + heuristic(neighbor, target));
					
					openSet.reorderUpFrom(neighbor);

					cameFrom.set(neighbor, currentNode);
				}
			} // end for...of loop

        } // end while

    } //end Search

	getPath()
	{
		const path = [];
		
		let {target} = this;


		if (!this.cameFrom.has(target) || !this.cameFrom.size)
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

		this.fScore.clear();
		this.fScore = undefined;

		this.openSet.orderedArr.length = 0;
		this.openSet.orderedArr = undefined;
		this.openSet.distancesMap = undefined;
		this.openSet = undefined;

		this.gScore.clear();
		this.gScore = undefined;

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