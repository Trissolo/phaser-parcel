// [
//   {x: 0, y: 0, dist: 0, name: "A"},
//   {x: 1, y: 1, dist: 10, name: "B"},
//   {x: 2, y: 2, dist: 20, name: "C"},
//   {x: 3, y: 3, dist: 30, name: "D"},
//   {x: 4, y: 4, dist: 40, name: "E"}
// ]

export default class IndexedPriorityQueue
{
    keys;
    data;
    #comp = (a, b) => this.keys[a] > this.keys[b];
	
	constructor(keys)
	{
		this.keys = keys;
		this.data = [];
	}
	
	insert(index)
	{
    this.data.push(index);
    
		this.reorderUp();
	}
	
	pop(data = this.data)
	{
		const ret = data[0];
		
		data[0] = data[data.length - 1];
		
		data.pop();
		
		this.reorderDown();
		
		return ret;
	}
	
	reorderUp(data = this.data, keys = this.keys)
	{
    for (let a = data.length; --a;)
		{
			if (keys[data[a]] < keys[data[a - 1]])
			{
				const tmp = data[a];
				data[a] = data[a - 1];
				data[a - 1] = tmp;
			}
			
			else return;
		}
	}
	
	reorderDown(data = this.data, keys = this.keys)
	{
		for (let a = 0, len = data.length - 1; a < len; a++)
		{
			if (keys[data[a]] > keys[data[a + 1]])
			{
				const tmp = data[a];
				data[a] = data[a + 1];
				data[a + 1] = tmp;
			}
			else return;
		}
	}
	
	isEmpty()
	{
		return this.data.length === 0;
	}

    sort()
    {
        this.data.sort(this.#comp);
    }

    reorderUpFrom(a, data = this.data, keys = this.keys)
    {
        
        for (a = Math.min(data.length, a + 1); --a;)
        {
            if (keys[data[a]] < keys[data[a - 1]])
            {
            const tmp = data[a];
            data[a] = data[a - 1];
            data[a - 1] = tmp;
            }
            
            else return;
        }

    }

}
