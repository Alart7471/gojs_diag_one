import React, { useEffect, useRef } from "react";
import go from 'gojs';

const Diag = () => {
    const diagramRef = useRef(null);
    const legendRef = useRef(null);
    const diagramInstance = useRef(null);
    const legendInstance = useRef(null);

    const shapes = ["Rectangle", "Ellipse", "Triangle", "RoundedRectangle"];
    const colors = ["Red", "Blue", "Green", "Yellow", "Gray"];
    const nodeCount = Math.floor(Math.random() * 19) + 2;

    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
        key: `Node ${i + 1}`,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        index: i + 1,
    }));

    const legendData = nodes.map(node => ({
        shape: node.shape,
        color: node.color,
        text: `${node.shape} (${node.index})`,
    }));

    useEffect(() => {
        const $ = go.GraphObject.make;

        diagramInstance.current = $(go.Diagram, diagramRef.current, {
            initialContentAlignment: go.Spot.Center,
            layout: $(go.ForceDirectedLayout),
            "undoManager.isEnabled": true,
        });

        diagramInstance.current.nodeTemplate = $(go.Node, "Auto",
            $(go.Shape,
                {
                    figure: "RoundedRectangle",
                    fill: "white",
                    strokeWidth: 1,
                    stroke: "black",
                },
                new go.Binding("figure", "shape"),
                new go.Binding("fill", "color")
            ),
            $(go.TextBlock, { margin: 8, editable: false },
                new go.Binding("text", "key")
            )
        );

        diagramInstance.current.model = new go.GraphLinksModel(nodes);

        legendInstance.current = $(go.Diagram, legendRef.current, {
            initialContentAlignment: go.Spot.TopLeft,
            allowHorizontalScroll: false,
            allowVerticalScroll: false,
            layout: $(go.GridLayout, {
                wrappingColumn: 1,
                alignment: go.GridLayout.Position,
            }),
        });

        legendInstance.current.nodeTemplate = $(go.Node, "Horizontal",
            $(go.Shape, { width: 30, height: 30, margin: 5 },
                new go.Binding("figure", "shape"),
                new go.Binding("fill", "color")
            ),
            $(go.TextBlock, { margin: 5 },
                new go.Binding("text", "text")
            )
        );

        legendInstance.current.model = new go.GraphLinksModel(legendData);

        legendInstance.current.nodeTemplate.selectionAdorned = false;
        legendInstance.current.nodeTemplate.isMovable = false;

        return () => {
            diagramInstance.current.div = null;
            legendInstance.current.div = null;
        };
    }, [nodes, legendData]);

    const handleExport = async () => {
        const diagram = diagramInstance.current;
        const legendDiagram = legendInstance.current;

        const diagramImage = await diagram.makeImage({ scale: 1 });
        const legendImage = await legendDiagram.makeImage({ scale: 1 });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const totalWidth = diagramImage.width + 20 + legendImage.width;
        const totalHeight = Math.max(diagramImage.height, legendImage.height);

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        try {
          const addWhiteBackground = window.confirm("Add a white background?");
          if (addWhiteBackground) {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const addGrayBackground = window.confirm("Add a gray background for the main diagram?");
          if (addGrayBackground) {
            ctx.fillStyle = "gray";
            ctx.fillRect(legendImage.width + 20, 0, diagramImage.width, diagramImage.height);
          }

          ctx.drawImage(legendImage, 0, 0);
          ctx.drawImage(diagramImage, legendImage.width + 20, 0);

          const imageUrl = canvas.toDataURL("image/png");

          const link = document.createElement("a");
          link.href = imageUrl;
          link.download = "diagram_with_legend.png";
          link.click();
        } catch (error) {
          console.error("Error during image export:", error);
        }
    };

    return (
        <div>
            <h2>Diagram with Vertical Legend</h2>
            <div style={{ display: "flex" }}>
                <div
                    ref={legendRef}
                    style={{
                        width: "200px",
                        height: `${Math.max(400, nodes.length * 52)}px`,
                        border: "1px solid black",
                        marginRight: "20px",
                        overflow: "auto",
                    }}
                ></div>
                <div
                    ref={diagramRef}
                    style={{
                        width: `${Math.max(600, nodes.length * 60)}px`,
                        height: `${Math.max(400, nodes.length * 60)}px`,
                        border: "1px solid black",
                    }}
                ></div>
            </div>

            <button onClick={handleExport}>Export Diagram</button>
        </div>
    );
};

export default Diag;

