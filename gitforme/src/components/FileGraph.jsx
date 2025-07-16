import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const FileGraph = ({ treeData, onFileSelect, onFolderSelect, focusedNode }) => {
    const svgRef = useRef();
    const containerRef = useRef();
    const zoomRef = useRef();
    const simulationRef = useRef();
    
    // SVG icons for different file types
    const fileIcons = {
        js: `<path d="M12 2a2 2 0 00-2 2v2h-2a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zm-2 4h4v2h-4V6zm-2 4h8v8H8v-8z" />`,
        json: `<path d="M12 2a2 2 0 00-2 2v2H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zm-2 4h4v2h-4V6zm-2 4h8v6H8v-6z" />`,
        md: `<path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6zm4 2v2h8V8H8zm0 4v2h8v-2H8zm0 4v2h5v-2H8z" />`,
        html: `<path d="M12 2L2 7l10 5 10-5L12 2zM4.47 8.5L12 12.5l7.53-4L12 4.5 4.47 8.5zM2 17l10 5 10-5-10-5-10 5z" />`,
        css: `<path d="M12 2L2 7l10 5 10-5L12 2zM4.47 8.5L12 12.5l7.53-4L12 4.5 4.47 8.5zM2 17l10 5 10-5-10-5-10 5z" />`,
        py: `<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 5a1 1 0 112 0v5h-2V7zm0 7a1 1 0 112 0 1 1 0 01-2 0z" />`,
        default: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 4h7v5h5v11H6V4z" />`
    };
    const getIcon = (filename) => fileIcons[filename.split('.').pop()] || fileIcons.default;

    useEffect(() => {
        if (!treeData || treeData.length === 0 || !containerRef.current) return;

        const { width, height } = containerRef.current.getBoundingClientRect();
        const allNodes = treeData.map(d => ({ ...d, id: d.path, name: d.path.split('/').pop() }));

        const nodes = focusedNode ? allNodes.filter(n => n.id === focusedNode.id || n.path.startsWith(focusedNode.path + '/')) : allNodes;
        const nodeMap = new Map(nodes.map(n => [n.id, n]));
        const links = nodes.filter(n => nodeMap.has(n.path.substring(0, n.path.lastIndexOf('/'))))
                           .map(n => ({ source: n.path.substring(0, n.path.lastIndexOf('/')), target: n.id }));

        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
        svg.selectAll("*").remove();
        
        const g = svg.append('g');

        // Define gradients and filters for visual effects
        const defs = g.append('defs');
        const folderGradient = defs.append("radialGradient").attr("id", "folderGradient").attr("cx", "30%").attr("cy", "30%");
        folderGradient.append("stop").attr("offset", "0%").attr("stop-color", "#FDE68A");
        folderGradient.append("stop").attr("offset", "100%").attr("stop-color", "#FBBF24");
        
        const fileGradient = defs.append("radialGradient").attr("id", "fileGradient").attr("cx", "30%").attr("cy", "30%");
        fileGradient.append("stop").attr("offset", "0%").attr("stop-color", "#E5E7EB");
        fileGradient.append("stop").attr("offset", "100%").attr("stop-color", "#9CA3AF");

        const glow = defs.append("filter").attr("id", "glow");
        glow.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
        const feMerge = glow.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        simulationRef.current = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(80).strength(0.5))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(0, 0))
            .force("collision", d3.forceCollide().radius(d => (d.type === 'tree' ? 30 : 20) + 5));

        const link = g.append("g").attr("stroke", "#9CA3AF").attr("stroke-opacity", 0.6).selectAll("line").data(links).join("line").attr("stroke-width", 1.5);

        const node = g.append("g").selectAll("g").data(nodes).join("g").call(drag(simulationRef.current));

        node.style("cursor", "pointer")
            .on('mouseover', (event, d) => d3.select(event.currentTarget).select('circle').style("filter", "url(#glow)"))
            .on('mouseout', (event, d) => d3.select(event.currentTarget).select('circle').style("filter", null))
            .on('click', (event, d) => { if(d.type !== 'tree') onFileSelect(d); })
            .on('dblclick', (event, d) => { if(d.type === 'tree') onFolderSelect(d); });
            
        node.append("circle")
            .attr("r", d => d.type === 'tree' ? 30 : 20)
            .attr("fill", d => d.type === 'tree' ? 'url(#folderGradient)' : 'url(#fileGradient)')
            .attr("stroke", "#111827").attr("stroke-width", 2);

        node.append("g").attr("transform", "translate(-10, -10)")
            .append("svg").attr("viewBox", "0 0 24 24").attr("width", 20).attr("height", 20).attr("fill", "#1F2937")
            .html(d => d.type === 'tree' ? `<path d="M10 4H4c-1.11 0-2 .89-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />` : getIcon(d.name));

        node.append("text").text(d => d.name)
            .attr("y", d => (d.type === 'tree' ? 42 : 32))
            .attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#111827")
            .style("pointer-events", "none").clone(true).lower().attr("stroke", "white").attr("stroke-width", 3).attr("stroke-linejoin", "round");

        simulationRef.current.on("tick", () => {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y).attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        function drag(simulation) {
            function dragstarted(event, d) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
            function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
            function dragended(event, d) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
            return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

        zoomRef.current = d3.zoom().scaleExtent([0.1, 4]).on("zoom", (event) => g.attr("transform", event.transform));
        
        const initialScale = focusedNode ? 1 : 0.7;
        const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(initialScale);
        svg.call(zoomRef.current).call(zoomRef.current.transform, initialTransform).on("dblclick.zoom", null);
        
        // Let the simulation "warm up"
        simulationRef.current.alpha(0.3).restart();

    }, [treeData, focusedNode, onFileSelect, onFolderSelect]);

    const handleResetView = () => {
        if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();
        const initialTransform = d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7);
        d3.select(svgRef.current).transition().duration(750).call(zoomRef.current.transform, initialTransform);
        onFolderSelect(null); // This will trigger a re-render with the full tree
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
            <svg ref={svgRef}></svg>
            <div className="absolute top-3 right-3">
                <button onClick={handleResetView} className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md">Reset View</button>
            </div>
            <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm p-3 border-2 border-black rounded-lg text-xs max-w-sm shadow-md">
                <p><b>Navigate:</b> Scroll to zoom, drag to pan.</p>
                <p><b>Explore:</b> Click a file to preview, double-click a folder to focus.</p>
            </div>
        </div>
    );
};
export { FileGraph }; 