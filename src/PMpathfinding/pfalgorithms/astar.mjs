import Phaser from "phaser";

export default class AStar
{
    constructor(start, target, graph, heuristic = Phaser.Math.Distance.BetweenPoints, debug)
	{
		this.start = start;
		this.target = target;
		
		this.heuristic = heuristic;
		this.graph = graph;
		// this.targetVector = targetVector

		//Shortest Path Tree: this array contains the lowest cost edge to get to a specific node
		this.SPTstocazz = [];
		
		//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
		this.gScore = [];
		
		// For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    	// how short a path from start to finish can be if it goes through n.
		this.fScore = [];

		//Search Frontier
		this.SF = [];
		
		// for (let i = 0, len = this.edges.length; i < len; i++)
        // {
		// 	this.gScore[i] = 0
		// 	this.fScore[i] = 0
		// }

		// this.search()
	}
	
	search()
	{
		//The PRIORITY QUEUE is now sorted depending on the F cost vector
		const openList = new IndexedPriorityQueue(this.fScore);
		
		openList.insert(this.startIndex);
    }
}