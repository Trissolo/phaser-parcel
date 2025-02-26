const CONSTANTS = {
	TextureKey: 'debugFloor',
	walkableFillCol: 0xe6e0ec,
	obstacleFillCol: 0x2378db,
	concaveCol: 0xcaa9de,
	edgeCol:0xcdef53,
	pathCol: 0xffff33
}

export default class PMpathfindingDebug
{
    // manager = null;
    // scene;
    // graphics = null;
    constructor(manager)
    {
        this.manager = manager;
        this.scene = manager.scene;

        console.log("Debug", this)
        this.graphics = this.scene.add.graphics({x:0, y:0}).setDepth(0);

		//debug text		
		this.debugText = this.scene.add.bitmapText(4, 1, 'bianco', 'Test!').setDepth(Number.MAX_SAFE_INTEGER).setTintFill(0x666666);
		// this.scene.add.text(10, 10, "-Debug Info-", {
        //     fontSize: "12px",
        //     fill: "gray"
        // }).setDepth(9999)

		// this.scene.input.keyboard.on('keydown-Z', this.pressedZ, this)
    }

    showConcave(visMap)
    {
        for (const vertex of visMap.graph.keys())
        {
            this.showVector(vertex)
        }
    }

	showGraph(graph)
	{
		this.graphics.clear()
		for(const [node, edges] of graph)
		{
			for(const [neigh, qwe] of edges)
			{
				this.lineFromVecs(node, neigh);
			}
		}
	}

	lineFromVecs(vecA, vecB, color = CONSTANTS.edgeCol)
	{
		this.setLineColor(color);

		if (vecB)
		{
			this.graphics.lineBetween(vecA.x, vecA.y, vecB.x, vecB.y)
		}
		else
		{
			this.graphics.strokeLineShape(vecA)
		}
	}

    showVector(vector)
	{
		
		this.graphics.fillPoint(vector.x, vector.y, 3)
	}

	fillCircle(vector, col = 0xffffff)
	{
		this.setFillColor(col);
		this.graphics.fillCircle(vector.x, vector.y, 4);
	}

    showPolygon(pointsAry, color = CONSTANTS.walkableFillCol)
    {
        this.setFillColor(color)
        console.log("pointsAry", pointsAry)
        this.graphics.fillPoints(pointsAry, true, false)
    }

	showPath(vecAry, color = 0xffff99)
	{
		this.setLineColor(color);
        this.graphics.strokePoints(vecAry, false, false);
	}

	setFillColor(hexCol = 0xffffff)
	{
		this.graphics.fillStyle(hexCol, 1)
	}

	setLineColor(hexCol = 0xffff00, lineWidth = 1)
	{
		this.graphics.lineStyle(lineWidth, hexCol, 1)
	}

    showAsImage(polygonalMap, showConcave = true)
	{
		const {graphics} = this
		let col = CONSTANTS.walkableFillCol
		const alpha = 1
        this.setFillColor(col, alpha)
		
		for (const poly of polygonalMap.polygons.values())
		{
            graphics.fillPoints(poly.points, true, false)
			this.setFillColor(CONSTANTS.obstacleFillCol, alpha)
		}

		if (showConcave)
		{
			this.setFillColor(CONSTANTS.concaveCol, 1)
			
			//console.log("%cDEBUG_PMap", "background: purple", ...polygonalMap.graph.nodeMap.keys())
			for (const vertex of polygonalMap.graph.keys())
			{
				graphics.fillPoint(vertex.x, vertex.y, 3)
			}
		}

		//If the debug texture exists, then destroy it!
		this.clearTexture()

		graphics.generateTexture(CONSTANTS.TextureKey)

		this.polygonalMapAsImage = this.scene.add.image(0, 0, CONSTANTS.TextureKey).setOrigin(0, 0)//.setDepth(0)
		this.scene.children.sendToBack(this.polygonalMapAsImage)
		
		graphics.clear()
	}

	setText(text)
	{
		this.debugText.setText(text);
	}

	addText(text)
	{
		this.debugText.text += text;
	}

	setWordTint(word, count, color)
	{
		this.debugText.setWordTint(word, count, true, color)
	}

	resetBackgroundColor()
	{
		this.scene.cameras.main.setBackgroundColor()
	}

	setBackgroundColor(hexCol)// = 0xff5678)
	{
		this.scene.cameras.main.setBackgroundColor(hexCol)
	}

	alert(message, clearText = true, bgCol = 0x987634)
	{
		this.setBackgroundColor(bgCol);

		if (message)
		{
			if (clearText)
			{
				this.setText(message);
			}
			else
			{
				this.addText(message);
			}
		}

	}

	reset()
	{
		this.resetBackgroundColor()
		this.graphics.clear()
	}

    clearTexture()
	{
		if (this.scene.textures.exists(CONSTANTS.TextureKey))
		{
			this.scene.textures.remove(CONSTANTS.TextureKey)
		}
	}
}