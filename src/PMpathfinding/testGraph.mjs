import Phaser from "phaser"

export default class testGraph
{
    addNode(node, graph = new Map())
    {
        graph.set(node, new Map());
        // return node
    }

    edgesContainerOf(node, graph)
    {
        return graph.get(node);
    }

    edgeAlreadyExists(from, to, graph)
    {
        return graph.has(from) && this.edgesContainerOf(node, graph).has(from)
    }

    connect(from, to, graph)
    {
        if (!this.edgeAlreadyExists(from, to, graph))
        {
            edgesContainerOf(from, graph).set(to, Phaser.Math.Distance.BetweenPoints(from, to));
        }
    }

    cloneGraph(graph)
    {
        const cloneGraph = new Map()
        for (const [orig, container] of graph)
        {
            const cloneCont = new Map();
            cloneGraph.set(orig, cloneCont);
           for (const [neigh, dist] of container)
           {
            cloneCont.set(neigh, dist)
           }

        }
        return cloneGraph
    }
}