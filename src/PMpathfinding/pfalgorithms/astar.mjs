import Phaser from "phaser";
import PriorityQueue from "./PriorityQueue.mjs";

export default class AStar
{
    constructor(start, target, graph, debug, heuristic = Phaser.Math.Distance.BetweenPoints)
	{
		this.start = start;

		this.target = target;
		

		this.graph = graph;
        
		this.heuristic = heuristic;

		//Shortest Path Tree: this array contains the lowest cost edge to get to a specific node
		// this.SPTstocazz = [];
		
		//Search Frontier
		// this.searchFrontier = new Set();

		this.cameFrom = new Map();

		//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
		// gScore === costSoFar
		// key: node, value: dist
		this.costSoFar = new Map(); //[];
		
		// For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    	// how short a path from start to finish can be if it goes through n.
		// key: node, value: dist
		this.fScore = new Map(); //[];

		//populate gScore and fScore
        for (const node of graph.keys())
        {
            this.fScore.set(node, 0);//Number.MAX_SAFE_INTEGER);

            // this.costSoFar.set(node, 0);
        };

		this.costSoFar.set(this.start, 0);
		this.fScore.set(this.start, 0);

        // console.log(this.gScore);
  

		this.search()
	}	
	
	search()
	{
		let advanc = 0;
		console.log("SEARCH");

		//The PRIORITY QUEUE is now sorted depending on the F cost vector
		const frontier = new PriorityQueue(this.fScore);
		
		frontier.insert(this.start);
		// this.searchFrontier.add(this.start)

        while(!frontier.isEmpty())
		{
			const currentNode = frontier.pop();

			
			// console.log("%cAdvanc:", "background-color: #589");
			// this.costSoFar.set(currentNode, 0)

			if (currentNode === this.target) { return this};//.getPath() };


			for (const [neighbor, distance] of this.graph.get(currentNode))
			{
				// console.log(currentNode);
				// console.log(neighbor);
				// console.log(distance);

				// console.dir("CSF", this.costSoFar)



				// yield null

				const newCost = (this.costSoFar.get(currentNode) + distance);

				const betterCost = newCost < this.costSoFar.get(neighbor)

				// console.log(newCost, betterCost)

				// yield null;

				if(!this.cameFrom.has(neighbor) || betterCost)
				{
					this.costSoFar.set(neighbor, newCost);

					this.fScore.set(neighbor, newCost + this.heuristic(neighbor, this.target));
					
					this.cameFrom.set(neighbor, currentNode);

					betterCost? frontier.reorderUpFrom(neighbor) : frontier.insert(neighbor)
					// if (betterCost)
					// {
					// 	console.log("fr reoupFrom DENT", frontier);
					// 	frontier.reorderUpFrom(neighbor);
					// }
					// else
					// {
					// 	console.log("fr adding DENT");
					// 	frontier.insert(neighbor)
					// }
				}
				
			}
        }

		// console.log("While ended: no path exists")
		// return []//this.getPath()
    }

	getPath()
	{
		let {target} = this;
		
		const path = [];

		if (!this.cameFrom.has(target) || !this.cameFrom.size) {return console.log("I N V A L I D!"), path}
		
		path.push(target)

		// console.log("this.camefrom", this.cameFrom.size)

		while (target !== this.start && (this.cameFrom.has(target) || this.cameFrom.get(target) === undefined))
		{
			target = this.cameFrom.get(target);
			path.push(target)
		}

		return path

	}
}
