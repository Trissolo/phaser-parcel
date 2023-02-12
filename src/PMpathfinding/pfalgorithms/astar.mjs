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
		this.SPTstocazz = [];
		
		//Search Frontier
		this.searchFrontier = [];

		this.cameFrom = new Map();

		//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
		this.gScore = new Map(); //[];
		
		// For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    	// how short a path from start to finish can be if it goes through n.
		this.fScore = new Map(); //[];

		//populate gScore and fScore
        for (const node of graph.keys())
        {
            this.fScore.set(node, 0);

            this.gScore.set(node, 0);
        };

        // console.log(this.gScore);
  

		// this.search()
	}
	
	search()
	{
		//The PRIORITY QUEUE is now sorted depending on the F cost vector
		const frontier = new PriorityQueue(this.fScore);
		
		frontier.insert(this.start);

        // while(!frontier.isEmpty())
		// {
			//Next Closest Node index
			const currentNode = frontier.pop();

			if (currentNode === this.target) {return};

			for (const elem of this.graph.get(currentNode))
			{
				console.log(elem)
			}
        // }
    }
}



	// // constructorORI(edges, startIndex, targetIndex, targetVector)
	// constructor(edges, startIndex, targetIndex, targetVector)
	// {
	// 	this.startIndex = startIndex;

	// 	this.targetIndex = targetIndex;
		
	// 	this.targetVector = targetVector;

	// 	//shortcuts?
		
	// 	// this.heuristic = heuristic;
	// 	this.edges = edges;

	// 	//Shortest Path Tree: this array contains the lowest cost edge to get to a specific node
	// 	// this.SPT = []
		
	// 	//For node n, costSoFar[n] is the cost of the cheapest path from start to n currently known.
	// 	// cost_so_far
	// 	this.costSoFar = [];
		
	// 	// For node n, fScore[n] := costSoFar[n] + h(n). fScore[n] represents our current best guess as to
    // 	// how short a path from start to finish can be if it goes through n.
	// 	//priority
	// 	this.fScore = [];

	// 	//Search Frontier
	// 	this.came_from = [];
		
	// 	for (let i = 0, len = this.edges.length; i < len; i++) {
	// 		this.costSoFar[i] = 0
	// 		this.fScore[i] = 0
	// 	}

	// 	this.search()
	// }
	
	// searchOri()
	// {
	// 	//The PRIORITY QUEUE is now sorted depending on the F cost vector
	// 	const frontier = new IndexedPriorityQueue(this.fScore);
		
	// 	frontier.insert(this.startIndex)

	// 	while(!frontier.isEmpty())
	// 	{
	// 		//Next Closest Node index
	// 		const currentNodeIndex = frontier.pop()

	// 		if (currentNodeIndex === this.targetIndex) return// console.log("ENDAZZ"), this.getPath()// this.getPath()
			
			
	// 		for (const edge of this.edges[currentNodeIndex])
	// 		{
	// 			const Gcost = this.costSoFar[currentNodeIndex] + edge.cost;

				
	// 			const {to} = edge;
				
	// 			const betterCost = Gcost < this.costSoFar[to];
				
				
	// 			if (this.came_from[to] === undefined || betterCost)
	// 			{
	// 				//The H cost is obtained by the distance between the targetIndex node and the arrival node of the edge being analyzed	
	// 				const Hcost = heuristic(edge.toVector, this.targetVector) * adjConst; //this.maybeCost(edge.toVector)

	// 				this.costSoFar[to] = Gcost
	// 				this.fScore[to] = Gcost + Hcost

	// 				this.came_from[to] = edge
	// 			}
				
				
	// 		}
			
	// 	}// end while
	// }//end search function
	
	// getPath()
	// {		
	// 	let {targetIndex} = this;
		
	// 	const path = [];
		
	// 	// path.push(targetIndex);
	// 	if(this.came_from[targetIndex] === undefined) return console.log("Invalid!"), path
	// 	path.push(this.came_from[targetIndex].toVector);
		
	// 	while( targetIndex !== this.startIndex)// && this.came_from[targetIndex] !== undefined)
	// 	{
	// 		targetIndex = this.came_from[targetIndex].from;
	// 		path.push(this.came_from[targetIndex].toVector);
	// 	}



	// 	//remove last element from path: can be done somewhere else
	// 	path.length-= 1;

	// 	// console.log("RETURNING:", path);
	// 	return path
	// }
