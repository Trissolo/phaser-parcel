// [
//   {x: 0, y: 0, dist: 0, name: "A"},
//   {x: 1, y: 1, dist: 10, name: "B"},
//   {x: 2, y: 2, dist: 20, name: "C"},
//   {x: 3, y: 3, dist: 30, name: "D"},
//   {x: 4, y: 4, dist: 40, name: "E"}
// ]

export default class PriorityQueue
{
    // Es6 Map with key: node, and value: number.
    distancesMap;

    // Array: indexes priority, value: node.
    orderedArr = [];
    // #comp = (a, b) => this.distancesMap[a] > this.distancesMap[b];
    
    constructor(distancesMap)
    {
        this.distancesMap = distancesMap;
        // this.orderedArr = [];
    }
    
    insert(node)
    {
        console.log("Inserting:", node)
        this.orderedArr.push(node);
        
        this.reorderUp();
    }
    
    pop(orderedArr = this.orderedArr)
    {
        const ret = orderedArr[0];
        
        orderedArr[0] = orderedArr[orderedArr.length - 1];
        
        orderedArr.pop();
        
        this.reorderDown();
        
        return ret;
    }
    
    reorderUp(orderedArr = this.orderedArr, distancesMap = this.distancesMap)
    {
        console.log("reorderUp|Length:", orderedArr.length, distancesMap.get(orderedArr[orderedArr.length - 1]), distancesMap.get(orderedArr[orderedArr.length - 2]), "stoca");   
        for (let idx = orderedArr.length - 1; /*idx > 0 && */distancesMap.get(orderedArr[idx]) < distancesMap.get(orderedArr[idx - 1]); idx--)
        {
            console.log("%creorderUp Swapping:", "background-color: #0A2", orderedArr[idx], orderedArr[idx - 1]);//distancesMap.get(orderedArr[idx]), distancesMap.get(orderedArr[idx - 1]))
            // const tmp = orderedArr[idx];
            // orderedArr[idx] = orderedArr[idx - 1];
            // orderedArr[idx - 1] = tmp;

            [ orderedArr[idx], orderedArr[idx - 1] ] = [orderedArr[idx - 1], orderedArr[idx]];
        }
    }
    
    reorderDown(orderedArr = this.orderedArr, distancesMap = this.distancesMap)
    {
        // for (let idx = 0, len = orderedArr.length - 1; idx < len; idx++)
        for (let idx = 0; distancesMap.get(orderedArr[idx]) > distancesMap.get(orderedArr[idx + 1]); idx++)
        {
            console.log("%cDown. Swapping:", "background-color: #20A", orderedArr[idx], orderedArr[idx + 1]);
                // const tmp = orderedArr[idx];
                // orderedArr[idx] = orderedArr[idx + 1];
                // orderedArr[idx + 1] = tmp;
                [ orderedArr[idx], orderedArr[idx + 1] ] = [ orderedArr[idx + 1], orderedArr[idx] ];
        }
    }

    reorderUpFrom(node, orderedArr = this.orderedArr, distancesMap = this.distancesMap)
    {
        console.log("reorderUpFrom"); //|Length:", orderedArr.length, distancesMap.get(orderedArr[orderedArr.length - 1]), distancesMap.get(orderedArr[orderedArr.length - 2]), "stoca");   
        for (let idx = orderedArr.indexOf(node); /*idx > 0 && */distancesMap.get(orderedArr[idx]) < distancesMap.get(orderedArr[idx - 1]); idx--)
        {
            console.log("%creorderUp Swapping:", "background-color: #0A2", orderedArr[idx], orderedArr[idx - 1]);//distancesMap.get(orderedArr[idx]), distancesMap.get(orderedArr[idx - 1]))
            // const tmp = orderedArr[idx];
            // orderedArr[idx] = orderedArr[idx - 1];
            // orderedArr[idx - 1] = tmp;

            [ orderedArr[idx], orderedArr[idx - 1] ] = [orderedArr[idx - 1], orderedArr[idx]];
        }
    }
    
    isEmpty()
    {
        return this.orderedArr.length === 0;
    }

    // sort()
    // {
    //     this.orderedArr.sort(this.#comp);
    // }

    // reorderUpFrom(a, orderedArr = this.orderedArr, distancesMap = this.distancesMap)
    // {
        
    //     for (a = Math.min(orderedArr.length, a + 1); --a;)
    //     {
    //         if (distancesMap[orderedArr[a]] < distancesMap[orderedArr[a - 1]])
    //         {
    //         const tmp = orderedArr[a];
    //         orderedArr[a] = orderedArr[a - 1];
    //         orderedArr[a - 1] = tmp;
    //         }
            
    //         else return;
    //     }

    // }

}  // end class
