import Phaser from "phaser";

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

    edgeAlreadyExists(node, neighbor, graph)
    {
        return graph.has(node) && this.edgesContainerOf(node, graph).has(neighbor);
    }

    connect(node, neighbor, graph)
    {
        if (!this.edgeAlreadyExists(node, neighbor, graph))
        {
            const dist = Phaser.Math.Distance.BetweenPoints(node, neighbor);
            this.edgesContainerOf(node, graph).set(neighbor, dist);
            this.edgesContainerOf(neighbor, graph).set(node, dist);
        }
    }

    cloneGraph(graph)
    {
        const cloneGraph = new Map();

        for (const [orig, container] of graph)
        {

            const cloneCont = new Map();

            cloneGraph.set(orig, cloneCont);

            for (const [neigh, dist] of container)
            {
                cloneCont.set(neigh, dist);
            }

        }

        return cloneGraph
    }
}
