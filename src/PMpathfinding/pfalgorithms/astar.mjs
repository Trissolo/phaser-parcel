import Phaser from "phaser";
import testGraphHelper from "../testGraphHelper.mjs";
import PriorityQueue from "./PriorityQueue.mjs";

export default class AStar
{
	constructor(start, target, graph, debug, heuristic = Phaser.Math.Distance.BetweenPoints)
	{
		console.log("STOCAST")
		this.start = start;

		this.target = target;
		
		this.graph = graph;
        
		this.heuristic = heuristic;


		// key
		// this.cameFrom = new Map();

		//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
		// gScore === costSoFar
		// key: node, value: dist

		// this.costSoFar = new Map();
		
		// For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    	// how short a path from start to finish can be if it goes through n.
		// key: node, value: dist
		
		this.F_Cost = new Map();
		this.G_Cost = new Map();

		this.SPT = new Map();
		this.SF = new Map();


		//populate fScore
        for (const node of graph.keys())
        {
            this.F_Cost.set(node, 0); //Number.MAX_SAFE_INTEGER);
			this.G_Cost.set(node, 0);
        };

		// this.frontier = new PriorityQueue(this.fScore);

		//moved
		// this.costSoFar.set(this.start, 0);
		
		this.search()
	}

	search()
	{
		const {SPT, SF, start, target, G_Cost, F_Cost, graph} = this;
		const pq = new PriorityQueue(this.F_Cost);
		pq.insert(start);

		while (!pq.isEmpty())
		{
			const NCN = pq.pop();
			SPT.set(NCN, SF);
			if (NCN === target);
			for (const [neighbor, edgeCost] of graph.get(NCN))
			{
				const Hcost = this.heuristic(neighbor, target);
				const Gcost = G_Cost.get(neighbor) + edgeCost;
				if (!SF.has(neighbor))
				{
					SF.set(neighbor, NCN)
					F_Cost.set(neighbor, Gcost + Hcost);
					G_Cost.set(neighbor, Gcost);
					pq.insert(neighbor);
				}
				else if(Gcost < G_Cost.get(neighbor) && !SPT.has(neighbor))
				{
					F_Cost.set(neighbor, Gcost + Hcost);
					G_Cost.set(neighbor, Gcost);
					pq.reorderUpFrom(neighbor);
					SF.set(neighbor, NCN)
				}
			}
		}
	}

	getPath()
	{

		console.log(this.SF)
		const path = [];
		
		let {target} = this;


		if (!this.SF.has(target) || !this.SF.size)
		{
			return path
		}
		
		path.push(target);


		while (target !== this.start)
		{
			target = this.SF.get(target);

			// path.push(target);

			//new obj?
			path.push({x: target.x, y: target.y});
		}
		return path
	}

    // constructor(start, target, graph, debug, heuristic = Phaser.Math.Distance.BetweenPoints)
	// {
	// 	this.start = start;

	// 	this.target = target;
		
	// 	this.graph = graph;
        
	// 	this.heuristic = heuristic;


	// 	// key
	// 	this.cameFrom = new Map();

	// 	//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
	// 	// gScore === costSoFar
	// 	// key: node, value: dist

	// 	this.costSoFar = new Map();
		
	// 	// For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // 	// how short a path from start to finish can be if it goes through n.
	// 	// key: node, value: dist
		
	// 	this.fScore = new Map();

	// 	//populate fScore
    //     for (const node of graph.keys())
    //     {
    //         this.fScore.set(node, 0); //Number.MAX_SAFE_INTEGER);

    //     };

	// 	this.frontier = new PriorityQueue(this.fScore);

	// 	//moved
	// 	// this.costSoFar.set(this.start, 0);
		
	// 	this.search()
	// }	
	
	// search()
	// {
	// 	const {frontier, costSoFar, cameFrom, fScore, heuristic, start, target, graph} = this;
		
	// 	frontier.insert(start);

	// 	costSoFar.set(start, 0);

    //     while(!frontier.isEmpty() )
	// 	{
	// 		const currentNode = frontier.pop();

	// 		// console.log("%cAdvanc:", "background-color: #589");

	// 		if (currentNode === target) {console.log("B R E A K I N G"); break};//return this };//.getPath() };


	// 		for (const [neighbor, distance] of graph.get(currentNode))
	// 		{
	// 				const newCost = costSoFar.get(currentNode) + distance;

	// 				const betterCost = newCost < costSoFar.get(neighbor);


	// 				if(!cameFrom.has(neighbor) || betterCost)
	// 				{
	// 					costSoFar.set(neighbor, newCost);

	// 					fScore.set(neighbor, newCost + heuristic(neighbor, target));
						
	// 					cameFrom.set(neighbor, currentNode);

	// 					betterCost? frontier.reorderUpFrom(neighbor) : frontier.insert(neighbor)
	// 				}
	// 		} // end for...of loop

    //     } // end while

    // } //end Search

	// getPath()
	// {
	// 	const path = [];
		
	// 	let {target} = this;


	// 	if (!this.cameFrom.has(target) || !this.cameFrom.size)
	// 	{
	// 		this.destroy(); return path
	// 	}
		
	// 	path.push(target);


	// 	while (target !== this.start)
	// 	{
	// 		target = this.cameFrom.get(target);

	// 		// path.push(target);

	// 		//new obj?
	// 		path.push({x: target.x, y: target.y});
	// 	}

	// 	this.destroy();

	// 	return path
	// }

	// destroy()
	// {
	// 	// console.log("Destroying Finder", ...this.graph.get(this.start).keys())

	// 	this.fScore.clear();
	// 	this.fScore = undefined;

	// 	this.frontier.orderedArr.length = 0;
	// 	this.frontier.orderedArr = undefined;
	// 	this.frontier.distancesMap = undefined;
	// 	this.frontier = undefined;

	// 	this.costSoFar.clear();
	// 	this.costSoFar = undefined;

	// 	this.cameFrom.clear();
	// 	this.cameFrom = undefined;

	// 	this.heuristic = undefined;
	// 	this.start = undefined;
	// 	this.target = undefined;

	// 	testGraphHelper.destroyGraph(this.graph);
	// 	this.graph = undefined;

	// 	// console.log("Finder destr", this)
	// }
}
