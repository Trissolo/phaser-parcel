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
  

		// this.search()
	}

	
	// constructorOld(edges, startIndex, targetIndex, targetVector, pmsDebu)
	// {
	// 	this.startIndex = startIndex
	// 	this.targetIndex = targetIndex
		
	// 	//shortcuts?
	// 	//console.log("ELEn");
	// 	//debugEdge(edges[1])
	// 	//console.log("ELEFIN");
	// 	this.heuristic = heuristic
	// 	this.edges = edges
	// 	this.targetVector = targetVector

	// 	//Shortest Path Tree: this array contains the lowest cost edge to get to a specific node
	// 	this.SPTstocazz = []
		
	// 	//For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
	// 	this.gScore = []
		
	// 	// For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
    // 	// how short a path from start to finish can be if it goes through n.
	// 	this.fScore = []

	// 	//Search Frontier
	// 	this.SF = []
		
	// 	for (let i = 0, len = this.edges.length; i < len; i++) {
	// 		this.gScore[i] = 0
	// 		this.fScore[i] = 0
	// 	}

	// 	this.search()
	// }
	
	searchOld()
	{
		//The PRIORITY QUEUE is now sorted depending on the F cost vector
		const openList = new IndexedPriorityQueue(this.fScore);
		
		openList.insert(this.startIndex)
		// console.log("INI", this.edges[this.startIndex])
		// let debugCycle = 0;

		while(!openList.isEmpty())
		{
			//Next Closest Node index
			const currentNodeIndex = openList.pop()

			// console.log("\nInside the While", `Cycle: (${debugCycle++})`, currentNodeIndex)
			
			this.SPTstocazz[currentNodeIndex] = this.SF[currentNodeIndex]

			// console.log(`SPTstocazz - (${this.SPTstocazz.length})`,...this.SPTstocazz);

			// console.log(`SF - (${this.SF.length})`, ...this.SF);
			
			if ( currentNodeIndex === this.targetIndex ) return
			
			
			//const edges = this.edges[currentNodeIndex]
			
			for ( const edge of this.edges[currentNodeIndex] ) //edges )
			{
				// console.log(`curr:${currentNodeIndex},TO -> x: ${this.targetVector.x}, y: ${this.targetVector.y}`)
				// debugEdge(edge)
				const Gcost = this.gScore[currentNodeIndex] + edge.cost;
				
				//The H cost is obtained by the distance between the targetIndex node and the arrival node of the edge being analyzed	
				const Hcost = this.heuristic(edge.toVector, this.targetVector)// * 0.9 //this.maybeCost(edge.toVector)
				
				const { to } = edge
				// console.log(edge.toVector)
				if (this.SF[to] === undefined)
				{
					this.fScore[to] = Gcost + Hcost
					this.gScore[to] = Gcost

					openList.insert(to)

					this.SF[to] = edge
				}
				else if ( (Gcost < this.gScore[to]) && (this.SPTstocazz[to] === undefined) )
				{
					// console.log(`${to} Pri: ${this.fScore[to]}`)
					this.fScore[to] = Gcost + Hcost
					this.gScore[to] = Gcost
					// console.log(`${to} Pri: ${this.fScore[to]}`)
					openList.reorderUp()
					//openList.sort()
					// openList.reorderUpFrom(openList.data.indexOf(to))
					
					this.SF[to] = edge
				}
				
			}
			
		}// end while
	}//end search function
	
	getPathOld()
	{
		
		const path = []
		
		let { targetIndex } = this
		
		path.push(targetIndex)
		
		while( targetIndex !== this.startIndex && this.SPTstocazz[targetIndex] !== undefined)
		{
			targetIndex = this.SPTstocazz[targetIndex].from;
			path.push(targetIndex);
		}

		//for debug only:
		//console.dir("SPTstocazz, SF, score:", this.SPTstocazz, this.SF, this.fScore)
		this.testNullify()
		
		//remove last element from path: can be done somewhere else
		path.length--

		return path
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

			
			// console.log("%cAdvanc:", "background-color: #589", advanc++, this.graph.get(currentNode).size);
			// this.costSoFar.set(currentNode, 0)

			if (currentNode === this.target) {console.log("GOAL REACHED!", this.cameFrom); return};


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


					// betterCost? frontier.reorderUpFrom(neighbor) : frontier.insert(neighbor)
					if (betterCost)
					{
						console.log("fr reoupFrom DENT", frontier);
						frontier.reorderUpFrom(neighbor);
					}
					else
					{
						console.log("fr adding DENT");
						frontier.insert(neighbor)
					}
				}

				// betterCost? frontier.reorderUpFrom(neighbor) : frontier.insert(neighbor)
				// if (betterCost)
				// {
				// 	console.log("fr reoupFrom", frontier);
				// 	frontier.reorderUpFrom(neighbor);
				// }
				// else
				// {
				// 	console.log("fr adding");
				// 	frontier.insert(neighbor)
				// }
				
			}
        }
    }

	getPath()
	{
		let {target} = this;
		
		const path = [];

		if (!this.cameFrom.has(target) || !this.cameFrom.size) {return console.log("I N V A L I D!"), path}
		

		path.push(target)

		console.log("this.camefrom", this.cameFrom.size)


		while (target !== this.start && (this.cameFrom.has(target) || this.cameFrom.get(target) === undefined))
		{
			target = this.cameFrom.get(target);
			path.push(target)
		}

		return path


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
