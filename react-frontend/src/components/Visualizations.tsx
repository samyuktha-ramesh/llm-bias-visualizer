import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import { ApiResonseDataType } from '../types/data';


// later change to get the topic list via an api call
const topic_pairs = [
    ["arts", "science"],
    ["career", "family"],
    ["intelligence", "appearance"],
    ["male-nouns", "female-nouns"],
    ["male-person-names", "female-person-names"],
    ["male-pronouns", "female-pronouns"],
    ["male-stereotypes", "female-stereotypes"],
    ["negative-characteristics", "positive-characteristics"],
    ["richest-countries", "poorest-countries"],
    ["weak", "strong"]
]

const temp = [['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j'], ['k', 'l'], ['m', 'n'], ['o', 'p'], ['q', 'r'], ['s', 't']];

const topic_labels = topic_pairs.map(([concept1, concept2]) => `${concept1}-${concept2}`);

const topic_idx= {
    "arts": 0, "science": 1,
    "career": 2, "family":3,
    "intelligence": 4, "appearance": 5,
    "male nouns": 6, "female nouns": 7,
    "male names": 8, "female names": 9,
    "male pronouns": 10, "female pronouns": 11,
    "male stereotypes": 12, "female stereotypes": 13,
    "negative characteristics": 14, "positive characteristics":15,
    "richest countries":16, "poorest countries":17,
    "weak":18, "strong":19
}

const topicLabelMap = {
    "arts": "arts", 
    "science": "science",
    "career": "career", 
    "family": "family",
    "intelligence": "intelligence", 
    "appearance": "appearance",
    "male-nouns": "m-nouns", 
    "female-nouns": "f-nouns",
    "male-person-names": "m-names", 
    "female-person-names": "f-names",
    "male-pronouns": "m-pron", 
    "female-pronouns": "f-pron",
    "male-stereotypes": "m-stypes", 
    "female-stereotypes": "f-stypes",
    "negative-characteristics": "neg-chars", 
    "positive-characteristics": "pos-chars",
    "richest-countries": "rich-c", 
    "poorest-countries": "poor-c",
    "weak": "weak", 
    "strong": "strong"
}

const labelTopicMap = Object.fromEntries(
    Object.entries(topicLabelMap).map(([key, value]) => [value, key])
);

interface VisualizationGridProps {
    modelData: ApiResonseDataType;
    layer: number;
    threshold: number;
    type: string;
    activeComponents: Record<string, Set<string> | null>;
    setActiveComponents: (activeComponents: Record<string, Set<string> | null>) => void;
}

const VisualizationGrid: React.FC<VisualizationGridProps> = ({modelData, layer, threshold, type, activeComponents, setActiveComponents}) => {
    const WeatData = modelData["filtered_weat_data"];
    const Layer = layer;
    const Threshold = threshold;
    const Type = type;
    const umap_coords = modelData["umap_result"]; // {[model: string]: [number, number]}

    const chartRef = useRef<SVGSVGElement | null>(null);

    type Graph = Record<string, Set<string>>;
    type CC = Map<string, Set<string>>; // connected components

    const [graphs, setGraphs] = useState<Record<string, Graph>>({});
    const [connectedComponents, setConnectedComponents] = useState<Map<string, CC>>(new Map()); // edges are stored by name of node it originates from
    // const [activeComponents, setActiveComponents] = useState<Record<string, Set<string> | null>>({});

    useEffect(() => {
        const buildGraphs = () => {
            const newGraphs: Record<string, Graph> = {};
    
            Object.entries(WeatData).forEach(([model, weatMatrix]) => {
                Object.entries(weatMatrix).forEach(([weatKey, effectSize]) => {
                    const [X, Y, A, B] = weatKey.split('|');
                    if (!newGraphs[model]) newGraphs[model] = {};
                    if (!newGraphs[model][X]) newGraphs[model][X] = new Set();
                    if (!newGraphs[model][Y]) newGraphs[model][Y] = new Set();
                    if (!newGraphs[model][A]) newGraphs[model][A] = new Set();
                    if (!newGraphs[model][B]) newGraphs[model][B] = new Set();
    
                    if (effectSize > 0) {
                        newGraphs[model][X].add(A);
                        newGraphs[model][A].add(X); // reverse edge
                        newGraphs[model][Y].add(B);
                        newGraphs[model][B].add(Y); // reverse edge
                    } else {
                        newGraphs[model][X].add(B);
                        newGraphs[model][B].add(X); // reverse edge
                        newGraphs[model][Y].add(A);
                        newGraphs[model][A].add(Y); // reverse edge
                    }
                });
            });
    
            console.log("Graph built:", newGraphs);
            setGraphs(newGraphs);
        };
    
        buildGraphs();
    }, [WeatData, Layer, Threshold, Type]);
    
    useEffect(() => {
        if (!graphs || Object.keys(graphs).length === 0) return; // Ensure graph is not empty
    
        const findConnectedComponent = (model: string, startNode: string) => {
            if (!graphs[model] || !graphs[model][startNode]) return new Set<string>();
    
            const visited = new Set<string>();
            const stack = [startNode];
    
            while (stack.length > 0) {
                const node = stack.pop()! as string;
                if (!visited.has(node) && node in graphs[model]) {
                    visited.add(node);
                    stack.push(...Array.from(graphs[model][node]).filter(neighbor => !visited.has(neighbor)));
                }
            }
    
            return visited;
        };
        
        const newConnectedComponents = new Map<string, CC>();
        Object.keys(graphs).forEach(model => {
            const visited = new Set<string>();
            const modelComponents = new Map<string, Set<string>>();
            Object.keys(graphs[model]).forEach(topic => {
                if (!visited.has(topic)) {
                    const component = findConnectedComponent(model, topic) as Set<string>;
                    component.forEach(node => modelComponents.set(node as string, component));
                    component.forEach(node => visited.add(node as string));
                }
            });
            newConnectedComponents.set(model, modelComponents);
        });

        setConnectedComponents(newConnectedComponents);
        console.log("Found connected components", newConnectedComponents);
    
    }, [graphs]);
    

    useEffect(() => {
        const svg = d3.select(chartRef.current);

        const container = svg.node()?.parentElement;
        const width = container?.offsetWidth || 600;
        const height = container?.offsetHeight || 400;

        const xExtent = d3.extent(Object.values(umap_coords).map(d => d[0])) as [number, number];
        const yExtent = d3.extent(Object.values(umap_coords).map(d => d[1])) as [number, number];

        const xpadding = 27 * (xExtent[1] - xExtent[0]);
        const ypadding = 45 * (yExtent[1] - yExtent[0]);
        const xScale = d3.scaleLinear().domain([xExtent[0], xExtent[1]]).range([xpadding, width - xpadding]);

        const yScale = d3.scaleLinear().domain([yExtent[0], yExtent[1]]).range([height - ypadding, ypadding]);
        const radius = 30;

        // Clear previous SVG content
        svg.selectAll('*').remove();

        const groups = svg
            .selectAll('g')
            .data(Object.keys(umap_coords)) // Iterate over model names
            .enter()
            .append('g')
            .attr('transform', (modelName) => {
                const [x, y] = umap_coords[modelName];
                return `translate(${xScale(x)}, ${yScale(y)})`;
        });

        groups.append('circle')
            .attr('r', radius)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', 1);

        // Add topics around the circle borders
        groups.each(function (_, groupIdx) {
            const group = d3.select(this);
            const topicPositions: {x: number; y: number, labelX:number, labelY: number, topicLabel: string}[] = [];
            const midPoints: {x: number; y: number}[] = [];
            // CHANGE TO TOPICS LATER
            topic_pairs.forEach((pair, pair_idx) => {
                const pairOffset = 0.1; // how close the the topics in a pair are positioned 
                const baseAngle = pair_idx / topic_pairs.length * 2 * Math.PI; // Calculate angle
                
                let midx = 0
                let midy = 0

                pair.forEach((topic, topicIdx) => {
                    const angle = baseAngle + (topicIdx === 0 ? -pairOffset : pairOffset); // Adjust angle for pair closeness

                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);

                    // Label position
                    const labelOffset = 2;
                    const labelX = (radius + labelOffset) * Math.cos(angle);
                    const labelY = (radius + labelOffset) * Math.sin(angle);
                    
                    midx += x
                    midy += y

                    topicPositions.push({ x, y, labelX, labelY, topicLabel: topic });            
                });
                midx /= 2
                midy /= 2
                midPoints.push({x: midx, y: midy})
            });

            const model = Object.keys(WeatData)[groupIdx];

            function stringToColor(str: string): string {
                // Step 1: Hash the string to a numeric value
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash); // Simple hash function
                }
            
                // Step 2: Map the hash to a hue value (range from 0 to 360)
                const hue = Math.abs(hash % 360);
            
                // Step 3: Set a fixed saturation and lightness for a soft pastel color
                const saturation = 60;  // Moderate saturation for soft colors
                const lightness = 80;   // High lightness for pastel effect
            
                // Step 4: Return the HSL color value
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`
            };
    
            const topicColors = new Map<string, string>();
            Object.keys(topicLabelMap).forEach(topic => {
                const modelComponents = connectedComponents.get(model);
                const topicComponent = modelComponents?.get(topic) // Get the connected component of the topic
                // console.log("Connected component for topic", topic, ":", topicComponent);
                const componentString = topicComponent ? Array.from(topicComponent).sort().join('') : '';
                // console.log("Component string for", model, topic, ":", componentString);
                topicColors.set(topic, stringToColor(componentString));
            });
            // console.log("Topic colors for:", model, topicColors);
            
            const drawDirectedLine = (
                x1: number, y1: number, x2: number, y2: number, color: string
            ) => {
                const lineGenerator = d3.line<{ x: number; y: number }>()
                    .x((d: { x: number; y: number }) => d.x)
                    .y((d: { x: number; y: number }) => d.y)
                    .curve(d3.curveBasis);

                const data = [
                    { x: x1, y: y1 },
                    { x: (x1+x2)/2.5, y: (y1+y2)/2.5 },
                    { x: x2, y: y2 },
                ];

                group.append('path')
                    .datum(data)
                    .attr('d', lineGenerator)
                    .attr('fill', 'none')
                    .attr('stroke', color)
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrow)');

                const markerBoxWidth = 5;
                const markerBoxHeight = 5;
                const refX = markerBoxWidth / 2;
                const refY = markerBoxHeight / 2;
                const markerWidth = markerBoxWidth / 2;
                const markerHeight = markerBoxHeight / 2;
                group.append('defs')
                    .append('marker')
                    .attr('id', 'arrow')
                    .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
                    .attr('refX', refX)
                    .attr('refY', refY)
                    .attr('markerWidth', markerBoxWidth/2)
                    .attr('markerHeight', markerBoxHeight)
                    .attr('orient', 'auto-start-reverse')
                    .append('path')
                    .attr('d', d3.line()([[0, 0], [0, 5], [5, 2.5]]))
                    .attr('stroke', 'black');
            };
            
            
            // console.log(model);
            const WeatMatrix = WeatData[model];
            
            const topicStates: Record<string, { isBiased: boolean }> = {};
            topic_pairs.flat().forEach(topic => {
                topicStates[topic] = { isBiased: false };
            });
            
            midPoints.forEach((_, i) => {
                midPoints.forEach((_, j) => {
                    if (i !== j) {
                        // Construct the WEAT key "X|Y|A|B"
                        const X = topic_pairs[i][0];
                        const Y = topic_pairs[i][1];
                        const A = topic_pairs[j][0];
                        const B = topic_pairs[j][1];
                        const weatKey = `${X}|${Y}|${A}|${B}`;
            
                        if (weatKey in WeatMatrix) {
                            const effectSize = WeatMatrix[weatKey];
                            const color = 'red';
            
                            // console.log(`WEAT effect size for ${weatKey}: ${effectSize}`);
            
                            // Determine direction of the arrow based on sign
                            const [startX1, startY1, endX1, endY1,subconcept1] = effectSize > 0
                                ? [topicPositions[2 * i].x, topicPositions[2 * i].y, topicPositions[2 * j].x, topicPositions[2 * j].y, A]
                                : [topicPositions[2 * i].x, topicPositions[2 * i].y, topicPositions[2 * j + 1].x, topicPositions[2 * j + 1].y, B];
            
                            const [startX2, startY2, endX2, endY2, subconcept2] = effectSize > 0
                                ? [topicPositions[2 * i + 1].x, topicPositions[2 * i + 1].y, topicPositions[2 * j + 1].x, topicPositions[2 * j + 1].y, B]
                                : [topicPositions[2 * i + 1].x, topicPositions[2 * i + 1].y, topicPositions[2 * j].x, topicPositions[2 * j].y, A];
                        
                            // if (effectSize > 0){
                            //     graph[X].add(A)
                            //     graph[Y].add(B)
                            // }
                            // else{
                            //     graph[X].add(B)
                            //     graph[Y].add(A)
                            // }
                            // Draw directed lines
                            if (Object.keys(activeComponents).length === 0 || (activeComponents[model] && activeComponents[model]!.has(X))){
                                topicStates[X].isBiased = true; 
                                topicStates[subconcept1].isBiased = true;
                                const color = topicColors.get(X) || 'black';
                                drawDirectedLine(startX1, startY1, endX1, endY1, color);
                                // console.log("drew line from ", X);
                            }
                            if (Object.keys(activeComponents).length === 0 || (activeComponents[model] && activeComponents[model]!.has(Y))){
                                topicStates[Y].isBiased = true;
                                topicStates[subconcept2].isBiased = true;
                                const color = topicColors.get(Y) || 'black';
                                drawDirectedLine(startX2, startY2, endX2, endY2, color);
                                // console.log("drew line from ", Y);
                            }
                        }
                    }
                });
            });

            topicPositions.forEach(({ x, y, labelX, labelY, topicLabel }) => {
                const font_size = '10px';
                const displayOpaque =(Object.keys(activeComponents).length === 0 || (activeComponents[model] && activeComponents[model]!.has(topicLabel))) && topicStates[topicLabel].isBiased;
                if (displayOpaque){
                    group.append('text')
                        .attr('x', labelX)
                        .attr('y', labelY)
                        .attr('dy', '0.35em') // Adjust vertical alignment
                        .attr('text-anchor', function () {
                            return labelX > 0 ? 'start' : 'end'; // Align outward
                        })
                        .attr('transform', function() {
                            const rotation = (Math.atan2(labelY, labelX) * 180) / Math.PI;
                            return labelX > 0 ? `rotate(${rotation}, ${labelX}, ${labelY})` : `rotate(${rotation-180}, ${labelX}, ${labelY})`; // Rotate around the label position
                        })
                        .attr('class', 'topic-text')
                        .text(topicLabelMap[topicLabel as keyof typeof topicLabelMap])
                        .style('font-size', font_size)
                        .style('pointer-events', 'auto')
                        .style('cursor', 'pointer') 
                        .style('opacity', 1)
                        .style('stroke', topicColors.get(topicLabel) || 'black')
                        .style('stroke-width', '3');
                };
                group.append('text')
                    .attr('x', labelX)
                    .attr('y', labelY)
                    .attr('dy', '0.35em') // Adjust vertical alignment
                    .attr('text-anchor', function () {
                        return labelX > 0 ? 'start' : 'end'; // Align outward
                    })
                    .attr('transform', function() {
                        const rotation = (Math.atan2(labelY, labelX) * 180) / Math.PI;
                        return labelX > 0 ? `rotate(${rotation}, ${labelX}, ${labelY})` : `rotate(${rotation-180}, ${labelX}, ${labelY})`; // Rotate around the label position
                    })
                    .attr('class', 'topic-text')
                    .text(topicLabelMap[topicLabel as keyof typeof topicLabelMap])
                    .style('font-size', font_size)
                    .style('pointer-events', 'auto')
                    .style('cursor', 'pointer') 
                    .style('fill', 'black')
                    .style('opacity', displayOpaque ? 1 : 0.3);
            });

            const modelName = Object.keys(WeatData)[groupIdx];

            group.append('text')
                .attr('x', 0)  // Center the text horizontally
                .attr('y', radius + 60)  // Position the text below the circle
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .text(modelName)
                .style('font-size', '10px')
                .style('font-weight', 'bold')
                .style('pointer-events', 'none'); // Prevent interference
        }); 

        d3.selectAll('text.topic-text')
            .on('click', function(event) {
                const clickedTopic = d3.select(this).text();  // Get the label text of the clicked element
                const topicName = labelTopicMap[clickedTopic];
                console.log("Clicked on topic:", clickedTopic, topicName);
                console.log("Connected components:", connectedComponents);

                const newActiveComponents: Record<string, Set<string> | null> = {}; // temporary variable to store active components before state update
                Object.keys(graphs).forEach(model => {
                    const modelComponents = connectedComponents.get(model);
                    const component = modelComponents?.get(topicName);
        
                    newActiveComponents[model] = component || null;
                    console.log("Active component for model", model, ":", component);
                });

                setActiveComponents(newActiveComponents);
            });
           
    }, [WeatData, activeComponents, connectedComponents]);

    return <svg ref={chartRef} width="100%" height="100%" />;
};

export default VisualizationGrid;
