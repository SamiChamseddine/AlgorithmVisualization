import React, { useState, useEffect } from "react";
import { Delaunay } from "d3-delaunay";
import { motion } from "framer-motion";

const generateGraph = (numNodes, width, height) => {
  const nodes = Array.from({ length: numNodes }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
  }));

  const delaunay = Delaunay.from(nodes.map((n) => [n.x, n.y]));
  const edges = new Set();
  for (let i = 0; i < nodes.length; i++) {
    for (let j of delaunay.neighbors(i)) {
      edges.add([i, j].sort().toString());
    }
  }

  return {
    nodes,
    edges: Array.from(edges).map((e) => e.split(",").map(Number)),
    start: nodes[0],
    end: nodes[nodes.length - 1],
  };
};

const getNeighbors = (nodeIdx, edges) => {
  const neighbors = [];
  for (const [a, b] of edges) {
    if (a === nodeIdx) neighbors.push(b);
    if (b === nodeIdx) neighbors.push(a);
  }
  return neighbors;
};

const bfsPathfinding = (
  nodes,
  edges,
  start,
  end,
  setVisitedNodes,
  setDiscoveredEdges,
  setPath,
  speed
) => {
  const queue = [];
  const visited = new Set();
  const cameFrom = {};

  const startIdx = nodes.indexOf(start);
  const endIdx = nodes.indexOf(end);

  queue.push(startIdx);
  visited.add(startIdx);

  const interval = setInterval(() => {
    if (queue.length === 0) {
      clearInterval(interval);
      return;
    }

    const current = queue.shift();

    // Process current node
    if (current === endIdx) {
      clearInterval(interval);
      const path = [];
      let cur = endIdx;
      while (cur !== undefined) {
        path.unshift(nodes[cur]);
        cur = cameFrom[cur];
      }
      setPath(path);
      return;
    }

    // Process neighbors one by one (but only add to queue)
    const neighbors = getNeighbors(current, edges);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        cameFrom[neighbor] = current;
        queue.push(neighbor);
        setDiscoveredEdges((prev) =>
          new Set(prev).add([current, neighbor].sort().toString())
        );
      }
    }

    // Update visualization after processing current node
    setVisitedNodes(new Set([...visited].map((i) => nodes[i])));
  }, speed);

  return interval;
};

const dfsPathfinding = (
  nodes,
  edges,
  start,
  end,
  setVisitedNodes,
  setDiscoveredEdges,
  setPath,
  speed
) => {
  const stack = [];
  const visited = new Set();
  const cameFrom = {};
  const processedNeighbors = new Map();

  const startIdx = nodes.indexOf(start);
  const endIdx = nodes.indexOf(end);

  stack.push(startIdx);
  visited.add(startIdx);

  const interval = setInterval(() => {
    if (stack.length === 0) {
      clearInterval(interval);
      return;
    }

    const current = stack[stack.length - 1];

    if (current === endIdx) {
      clearInterval(interval);
      reconstructPath(cameFrom, startIdx, endIdx, setPath, nodes);
      return;
    }

    if (!processedNeighbors.has(current)) {
      processedNeighbors.set(current, {
        neighbors: getNeighbors(current, edges),
        index: 0,
      });
    }

    const nodeState = processedNeighbors.get(current);
    const { neighbors, index } = nodeState;

    if (index >= neighbors.length) {
      stack.pop();
      processedNeighbors.delete(current);
      return;
    }

    const neighbor = neighbors[index];
    nodeState.index++;

    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      cameFrom[neighbor] = current;
      stack.push(neighbor);
      setDiscoveredEdges((prev) =>
        new Set(prev).add([current, neighbor].sort().toString())
      );
    }

    setVisitedNodes(new Set([...visited].map((i) => nodes[i])));
  }, speed);

  return interval;
};

const reconstructPath = (cameFrom, startIdx, endIdx, setPath, nodes) => {
  const path = [];
  let current = endIdx;
  while (current !== startIdx) {
    path.push(nodes[current]);
    current = cameFrom[current];
  }
  path.push(nodes[startIdx]);
  path.reverse();
  setPath(path);
};

const dijkstraPathfinding = (
  nodes,
  edges,
  start,
  end,
  setVisitedNodes,
  setDiscoveredEdges,
  setPath,
  setPathDistance,
  speed
) => {
  const dist = Array(nodes.length).fill(Infinity);
  const prev = Array(nodes.length).fill(null);
  const visited = new Set();
  const pq = [];

  const nodeDist = (a, b) =>
    Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
  const startIdx = nodes.indexOf(start);
  const endIdx = nodes.indexOf(end);

  dist[startIdx] = 0;
  pq.push([0, startIdx]);

  const interval = setInterval(() => {
    if (pq.length === 0) {
      clearInterval(interval);
      return;
    }

    pq.sort((a, b) => a[0] - b[0]);
    const [_, u] = pq.shift();
    if (visited.has(u)) return;

    visited.add(u);
    setVisitedNodes(new Set([...visited].map((i) => nodes[i])));

    if (u === endIdx) {
      clearInterval(interval);
      const path = [];
      let cur = endIdx;
      let totalDistance = 0;
      while (cur !== null) {
        path.unshift(nodes[cur]);
        if (prev[cur] !== null) {
          totalDistance += nodeDist(cur, prev[cur]);
        }
        cur = prev[cur];
      }
      setPath(path);
      setPathDistance(totalDistance);
      return;
    }

    for (const [a, b] of edges) {
      const v = a === u ? b : b === u ? a : null;
      if (v !== null && !visited.has(v)) {
        const alt = dist[u] + nodeDist(u, v);
        if (alt < dist[v]) {
          dist[v] = alt;
          prev[v] = u;
          pq.push([alt, v]);
          setDiscoveredEdges((prevEdges) =>
            new Set(prevEdges).add([u, v].sort().toString())
          );
        }
      }
    }
  }, speed);

  return interval;
};

const aStarPathfinding = (
  nodes,
  edges,
  start,
  end,
  setVisitedNodes,
  setDiscoveredEdges,
  setPath,
  setPathDistance,
  speed
) => {
  const dist = Array(nodes.length).fill(Infinity);
  const prev = Array(nodes.length).fill(null);
  const visited = new Set();
  const pq = [];

  const heuristic = (a, b) =>
    Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
  const nodeDist = heuristic;

  const startIdx = nodes.indexOf(start);
  const endIdx = nodes.indexOf(end);

  dist[startIdx] = 0;
  pq.push([heuristic(startIdx, endIdx), startIdx]);

  const interval = setInterval(() => {
    if (pq.length === 0) {
      clearInterval(interval);
      return;
    }

    pq.sort((a, b) => a[0] - b[0]);
    const [_, u] = pq.shift();

    if (visited.has(u)) return;

    visited.add(u);
    setVisitedNodes(new Set([...visited].map((i) => nodes[i])));

    if (u === endIdx) {
      clearInterval(interval);
      const path = [];
      let cur = endIdx;
      let totalDistance = 0;
      while (cur !== null) {
        path.unshift(nodes[cur]);
        if (prev[cur] !== null) {
          totalDistance += nodeDist(cur, prev[cur]);
        }
        cur = prev[cur];
      }
      setPath(path);
      setPathDistance(totalDistance);
      return;
    }

    for (const [a, b] of edges) {
      const v = a === u ? b : b === u ? a : null;
      if (v !== null && !visited.has(v)) {
        const tentativeG = dist[u] + nodeDist(u, v);
        if (tentativeG < dist[v]) {
          dist[v] = tentativeG;
          prev[v] = u;
          const fScore = tentativeG + heuristic(v, endIdx);
          pq.push([fScore, v]);
          setDiscoveredEdges((prevEdges) =>
            new Set(prevEdges).add([u, v].sort().toString())
          );
        }
      }
    }
  }, speed);

  return interval;
};

// Helper: Precompute all-pairs shortest paths using Dijkstra
function computeAllPairsShortestPaths(nodes, edges) {
  const n = nodes.length;
  const distMatrix = Array(n)
    .fill()
    .map(() => Array(n).fill(Infinity));
  const prevMatrix = Array(n)
    .fill()
    .map(() => Array(n).fill(null));

  // Single-source Dijkstra
  function dijkstra(source) {
    const dist = Array(n).fill(Infinity);
    const prev = Array(n).fill(null);
    const pq = [];
    dist[source] = 0;
    pq.push([0, source]);

    while (pq.length > 0) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift();

      for (const [a, b] of edges) {
        const v = a === u ? b : b === u ? a : null;
        if (v !== null) {
          const edgeDist = Math.hypot(
            nodes[u].x - nodes[v].x,
            nodes[u].y - nodes[v].y
          );
          const newDist = d + edgeDist;
          if (newDist < dist[v]) {
            dist[v] = newDist;
            prev[v] = u;
            pq.push([newDist, v]);
          }
        }
      }
    }
    return { dist, prev };
  }

  // Build distance and predecessor matrices
  for (let i = 0; i < n; i++) {
    const { dist, prev } = dijkstra(i);
    distMatrix[i] = dist;
    prevMatrix[i] = prev;
  }

  return { distMatrix, prevMatrix };
}

// Helper: Reconstruct path between two nodes
function getPath(u, v, prevMatrix) {
  const path = [];
  let current = v;
  while (current !== u && current !== null) {
    path.unshift(current);
    current = prevMatrix[u][current];
  }
  if (current === u) path.unshift(u);
  return path;
}

// ================= FARTHEST INSERTION =================
const farthestInsertionPathfinding = (
  nodes,
  edges,
  start,
  _unusedEnd,
  setVisitedNodes,
  setDiscoveredEdges,
  setPath,
  setPathDistance,
  speed
) => {
  // Precompute shortest paths
  const { distMatrix, prevMatrix } = computeAllPairsShortestPaths(nodes, edges);
  const distance = (a, b) => distMatrix[a][b];

  const startIdx = nodes.indexOf(start);
  let tour = [startIdx];
  const visited = new Set([startIdx]);
  let discoveredEdges = new Set();

  const interval = setInterval(() => {
    if (tour.length === nodes.length) {
      // Reconstruct full path using actual edges
      const fullPath = [tour[0]];
      let totalDistance = 0;

      for (let i = 0; i < tour.length; i++) {
        const u = tour[i];
        const v = tour[(i + 1) % tour.length];
        const segment = getPath(u, v, prevMatrix);

        // Connect segments
        for (let j = 0; j < segment.length - 1; j++) {
          const edge = [segment[j], segment[j + 1]].sort().toString();
          discoveredEdges.add(edge);
          totalDistance += distance(segment[j], segment[j + 1]);
        }
        fullPath.push(...segment.slice(1));
      }

      setPath(fullPath.map((i) => nodes[i]));
      setPathDistance(totalDistance);
      setDiscoveredEdges(discoveredEdges);
      clearInterval(interval);
      return;
    }

    // Phase 1: Find farthest unvisited node
    let farthestNode = null;
    let maxDistance = -Infinity;

    nodes.forEach((_, nodeIdx) => {
      if (!visited.has(nodeIdx)) {
        let minDistToTour = Infinity;
        for (const tourNode of tour) {
          minDistToTour = Math.min(minDistToTour, distance(nodeIdx, tourNode));
        }
        if (minDistToTour > maxDistance) {
          maxDistance = minDistToTour;
          farthestNode = nodeIdx;
        }
      }
    });

    if (farthestNode === null) {
      clearInterval(interval);
      return;
    }

    // Phase 2: Find best insertion position
    let bestInsertIdx = 0;
    let minCostIncrease = Infinity;

    for (let i = 0; i < tour.length; i++) {
      const j = (i + 1) % tour.length;
      const a = tour[i];
      const b = tour[j];
      const costIncrease =
        distance(a, farthestNode) + distance(farthestNode, b) - distance(a, b);

      if (costIncrease < minCostIncrease) {
        minCostIncrease = costIncrease;
        bestInsertIdx = j;
      }
    }

    // Insert and update visualization
    tour.splice(bestInsertIdx, 0, farthestNode);
    visited.add(farthestNode);
    setVisitedNodes(new Set([...visited].map((i) => nodes[i])));

    // Update discovered edges (show current tour with virtual connections)
    const currentEdges = new Set();
    for (let i = 0; i < tour.length; i++) {
      const u = tour[i];
      const v = tour[(i + 1) % tour.length];
      currentEdges.add([u, v].sort().toString());
    }
    setDiscoveredEdges(currentEdges);
  }, speed);

  return interval;
};

// ================= NEAREST INSERTION =================
const nearestInsertionPathfinding = (
  nodes,
  edges,
  start,
  _unusedEnd,
  setVisitedNodes,
  setDiscoveredEdges,
  setPath,
  setPathDistance,
  speed
) => {
  // Precompute shortest paths
  const { distMatrix, prevMatrix } = computeAllPairsShortestPaths(nodes, edges);
  const distance = (a, b) => distMatrix[a][b];

  const startIdx = nodes.indexOf(start);
  let tour = [startIdx];
  const visited = new Set([startIdx]);
  let discoveredEdges = new Set();

  const interval = setInterval(() => {
    if (tour.length === nodes.length) {
      // Reconstruct full path using actual edges
      const fullPath = [tour[0]];
      let totalDistance = 0;

      for (let i = 0; i < tour.length; i++) {
        const u = tour[i];
        const v = tour[(i + 1) % tour.length];
        const segment = getPath(u, v, prevMatrix);

        for (let j = 0; j < segment.length - 1; j++) {
          const edge = [segment[j], segment[j + 1]].sort().toString();
          discoveredEdges.add(edge);
          totalDistance += distance(segment[j], segment[j + 1]);
        }
        fullPath.push(...segment.slice(1));
      }

      setPath(fullPath.map((i) => nodes[i]));
      setPathDistance(totalDistance);
      setDiscoveredEdges(discoveredEdges);
      clearInterval(interval);
      return;
    }

    // Phase 1: Find nearest unvisited node
    let nearestNode = null;
    let minDistance = Infinity;

    nodes.forEach((_, nodeIdx) => {
      if (!visited.has(nodeIdx)) {
        for (const tourNode of tour) {
          const d = distance(nodeIdx, tourNode);
          if (d < minDistance) {
            minDistance = d;
            nearestNode = nodeIdx;
          }
        }
      }
    });

    if (nearestNode === null) {
      clearInterval(interval);
      return;
    }

    // Phase 2: Find best insertion position
    let bestInsertIdx = 0;
    let minCostIncrease = Infinity;

    for (let i = 0; i < tour.length; i++) {
      const j = (i + 1) % tour.length;
      const a = tour[i];
      const b = tour[j];
      const costIncrease =
        distance(a, nearestNode) + distance(nearestNode, b) - distance(a, b);

      if (costIncrease < minCostIncrease) {
        minCostIncrease = costIncrease;
        bestInsertIdx = j;
      }
    }

    // Insert and update visualization
    tour.splice(bestInsertIdx, 0, nearestNode);
    visited.add(nearestNode);
    setVisitedNodes(new Set([...visited].map((i) => nodes[i])));

    // Update discovered edges
    const currentEdges = new Set();
    for (let i = 0; i < tour.length; i++) {
      const u = tour[i];
      const v = tour[(i + 1) % tour.length];
      currentEdges.add([u, v].sort().toString());
    }
    setDiscoveredEdges(currentEdges);
  }, speed);

  return interval;
};

const algorithmTitles = {
  bfs: "Breadth-First Search (BFS) Pathfinding",
  dfs: "Depth-First Search (DFS) Pathfinding",
  dijkstra: "Dijkstra's Algorithm Pathfinding",
  astar: "A* Search Algorithm Pathfinding",
  farthest: "Farthest Insertion TSP Algorithm",
  nearest: "Nearest Insertion TSP Algorithm",
};

const algorithmDescription = {
  bfs: `
Time Complexity: O(V + E) where V=vertices, E=edges
Space Complexity: O(V)
Guarantees shortest path in unweighted graphs
Explores all neighbors at current depth before moving deeper
Uses queue data structure (FIFO)
Ideal for:
  Unweighted graphs
  Finding shortest paths in networks
  Web crawling
Visualization shows:
  Layer-by-layer expansion
  Uniform exploration pattern`,

  dfs: `
Time Complexity: O(V + E) where V=vertices, E=edges
Space Complexity: O(V) (more memory-efficient for deep graphs)
Doesn't guarantee shortest path
Explores as far as possible along each branch before backtracking
Uses stack data structure (LIFO)
Ideal for:
  Maze solving
  Topological sorting
  Finding connected components
Visualization shows:
  Deep traversal before backtracking
  Potentially long, winding paths`,

  dijkstra: `
Time Complexity: O((V + E) log V) with priority queue
Space Complexity: O(V)
Guarantees shortest path in weighted graphs (non-negative weights)
Uses greedy approach with priority queue
Maintains tentative distances for all nodes
Key Features:
  Expands nodes with lowest current cost
  Cannot handle negative weights
Ideal for:
  Road networks
  Routing protocols
  Any weighted graph with non-negative edges
Visualization shows:
  Progressive cost updates
  "Wavefront" of expanding shortest paths`,

  astar: `
Time Complexity: O((V + E) log V) - depends on heuristic quality
Space Complexity: O(V)
Optimal when heuristic is admissible and consistent
Combines:
  g(n): Actual cost from start to node n
  h(n): Heuristic estimate to goal
More efficient than Dijkstra with good heuristic
Heuristic Types:
  Euclidean distance (for spatial graphs)
  Manhattan distance (grid-based)
Ideal for:
  Pathfinding in games
  Robotics navigation
  Any scenario with known goal position
Visualization shows:
  Directed search toward goal
  Priority based on f(n) = g(n) + h(n)`,

  farthest: `
Farthest Insertion (TSP Heuristic)
Time Complexity: O(N³) with preprocessing (N=number of nodes)
Space Complexity: O(N²) (due to distance matrix)
TSP Construction Heuristic:
  Starts with initial node
  Repeatedly adds farthest unvisited node
  Inserts at position causing minimal tour length increase
Key Features:
  Uses all-pairs shortest paths (Dijkstra)
  Handles incomplete graphs
  Produces longer but potentially better tours than nearest insertion
Optimization:
  Precomputes distance matrix for O(1) lookups
Visualization shows:
  Progressive tour construction
  Farthest node selection
  Final path uses actual graph edges`,

  nearest: `
Nearest Insertion (TSP Heuristic)
Time Complexity: O(N³) with preprocessing (N=number of nodes)
Space Complexity: O(N²) (distance matrix)
TSP Construction Heuristic:
  Starts with initial node
  Repeatedly adds nearest unvisited node
  Inserts at position causing minimal tour length increase
Key Features:
  Uses all-pairs shortest paths (Dijkstra)
  Handles incomplete graphs
  Produces more compact tours than farthest insertion
Optimization:
  Same distance matrix reuse as farthest insertion
Visualization shows:
   Progressive tour construction
   Nearest node selection
   Final path uses actual graph edges
Comparison with Farthest:
   Generally faster convergence
   Tends to create shorter local connections`,

  // Additional technical notes
  technicalNotes: `
Technical Implementation Notes:
──────────────────────────────
For TSP Heuristics (Farthest/Nearest):
  - Preprocessing uses Dijkstra's algorithm to create complete distance matrix
  - Final path reconstruction replaces virtual edges with actual shortest paths
  - Handles non-complete graphs transparently

For Pathfinders (BFS/DFS/Dijkstra/A*):
  - Edge discovery visualized in real-time
  - Path reconstruction tracks predecessor nodes

Visualization Features:
  - Visited nodes highlighted
  - Discovered edges shown progressively
  - Final path emphasized`,
};

const PathfindVisualizer = () => {
  const [numNodes, setNumNodes] = useState(100);
  const [graph, setGraph] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [discoveredEdges, setDiscoveredEdges] = useState(new Set());
  const [path, setPath] = useState([]);
  const [speed, setSpeed] = useState(100);
  const [intervalId, setIntervalId] = useState(null);
  const [algorithm, setAlgorithm] = useState("bfs");
  const [visitedCount, setVisitedCount] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [pathDistance, setPathDistance] = useState(0);

  const width = 600,
    height = 400;

  useEffect(() => {
    setGraph(generateGraph(numNodes, width, height));
  }, [numNodes]);

  useEffect(() => {
    setVisitedCount(visitedNodes.size);
  }, [visitedNodes]);

  useEffect(() => {
    setPathLength(path.length);
  }, [path]);

  const startPathfinding = () => {
    if (!graph) return;
    clearInterval(intervalId);
    setVisitedNodes(new Set());
    setDiscoveredEdges(new Set());
    setPath([]);
    setPathDistance(0);

    let id;
    if (algorithm === "farthest") {
      id = farthestInsertionPathfinding(
        graph.nodes,
        graph.edges,
        graph.start,
        graph.start,
        setVisitedNodes,
        setDiscoveredEdges,
        setPath,
        setPathDistance,
        speed
      );
    } else if (algorithm === "nearest") {
      id = nearestInsertionPathfinding(
        graph.nodes,
        graph.edges,
        graph.start,
        graph.start,
        setVisitedNodes,
        setDiscoveredEdges,
        setPath,
        setPathDistance,
        speed
      );
    } else {
      const basicProps = [
        graph.nodes,
        graph.edges,
        graph.start,
        graph.end,
        setVisitedNodes,
        setDiscoveredEdges,
        setPath,
        speed,
      ];
      const extendedProps = [
        graph.nodes,
        graph.edges,
        graph.start,
        graph.end,
        setVisitedNodes,
        setDiscoveredEdges,
        setPath,
        setPathDistance,
        speed,
      ];
      switch (algorithm) {
        case "bfs":
          id = bfsPathfinding(...basicProps);
          break;
        case "dfs":
          id = dfsPathfinding(...basicProps);
          break;
        case "dijkstra":
          id = dijkstraPathfinding(...extendedProps);
          break;
        case "astar":
          id = aStarPathfinding(...extendedProps);
          break;
        default:
          return;
      }
    }
    setIntervalId(id);
  };

  const resetGraph = () => {
    clearInterval(intervalId);
    setVisitedNodes(new Set());
    setDiscoveredEdges(new Set());
    setPath([]);
    setGraph(generateGraph(numNodes, width, height));
  };

  const isTSPAlgorithm = algorithm === "farthest" || algorithm === "nearest";

  return (
    <div className="flex flex-col items-center gap-6 p-3 bg-black  text-gray-200">
      <div className="text-center">
        <h3 className="text-4xl font-extrabold bg-gradient-to-r text-purple-500 bg-clip-text drop-shadow-[0_0_8px_#CA00B6] animate-pulse-slow">
          {" "}
          {algorithmTitles[algorithm]}
        </h3>
      </div>

      <div className="flex flex-col justify-end lg:flex-row w-full gap-4 max-w-6xl">
        <div className="flex flex-col gap-10 bg-black border border-gray-800 p-6 rounded-xl shadow-lg w-full lg:w-80">
          {" "}
          <button
            onClick={resetGraph}
            className="bg-rose-600 text-white py-3 px-6 rounded-lg shadow-lg transition "
          >
            Generate Map
          </button>
          <button
            onClick={startPathfinding}
            className="bg-purple-600 text-white py-3 px-6 rounded-lg shadow-lg transition "
          >
            Start Pathfinding
          </button>
          <div className="flex flex-col gap-1">
            <label className="text-gray-300 text-sm">Algorithm:</label>
            <select
              className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
            >
              <option value="bfs">Breadth-First Search</option>
              <option value="dfs">Depth-First Search</option>
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="astar">A* Search</option>
              <option value="farthest">Farthest Insertion</option>
              <option value="nearest">Nearest Insertion</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-300 text-sm">Nodes:</label>
            <select
              className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
              value={numNodes}
              onChange={(e) => setNumNodes(+e.target.value)}
            >
              {[10, 50, 100, 200, 500].map((n) => (
                <option key={n} value={n}>
                  {n} Nodes
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-gray-300 text-sm">Speed:</label>
            <select
              className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700"
              value={speed}
              onChange={(e) => setSpeed(+e.target.value)}
            >
              <option value={1}>Fast</option>
              <option value={100}>Medium</option>
              <option value={200}>Slow</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 p-1 bg-black  text-gray-200">
          <div className="flex-1 w-full bg-black rounded-xl shadow-xl overflow-hidden p-1 border border-gray-800">
            <svg
              width="100%"
              height="450"
              viewBox={`0 0 ${width} ${height}`}
              className="rounded-lg"
            >
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="gray"
                  strokeWidth="0.5"
                  strokeOpacity="0.2"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {graph?.edges.map(([a, b], i) => {
                const { x: x1, y: y1 } = graph.nodes[a];
                const { x: x2, y: y2 } = graph.nodes[b];
                const edgeKey = [a, b].sort().toString();
                return (
                  <motion.line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={
                      discoveredEdges.has(edgeKey) ? "#f59e0b" : "#FF007F"
                    }
                    strokeWidth={discoveredEdges.has(edgeKey) ? "2.5" : "1"}
                    strokeOpacity={discoveredEdges.has(edgeKey) ? "1" : "0.6"}
                  />
                );
              })}

              {path.length > 1 &&
                path.map((node, i) =>
                  i > 0 ? (
                    <motion.line
                      key={i}
                      x1={path[i - 1].x}
                      y1={path[i - 1].y}
                      x2={node.x}
                      y2={node.y}
                      stroke="#CA00B6"
                      strokeWidth="4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      style={{
                        filter:
                          "drop-shadow(0 0 5px #CA00B6) drop-shadow(0 0 15px #CA00B6)",
                      }}
                    />
                  ) : null
                )}

              {graph?.nodes.map((node, i) => {
                const isStart = node === graph.start;
                const isEnd = node === graph.end && !isTSPAlgorithm;
                return (
                  <motion.circle
                    key={i}
                    cx={node.x}
                    cy={node.y}
                    r={isStart || isEnd ? 8 : 4}
                    fill={
                      isStart
                        ? "#10b981"
                        : isEnd
                        ? "yellow"
                        : visitedNodes.has(node)
                        ? "#f59e0b"
                        : "#ffffff"
                    }
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="filter drop-shadow-[8px_8px_8px_#CA00B6]"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-1 bg-black border border-gray-800 p-6 rounded-xl shadow-lg w-full lg:w-80">
          <h4 className="text-xl font-bold text-center text-blue-400 drop-shadow-[0_0_8px_#80BCFF] animate-pulse-slow">
            Pathfinding Stats
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Visited Nodes:</span>
              <span className="text-yellow-300 font-medium">
                {visitedCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Path Length:</span>
              <span className="text-purple-300 font-medium">
                {pathLength - 1}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Path Distance:</span>
              <span className="text-purple-300 font-medium">
                {["dijkstra", "astar", "farthest", "nearest"].includes(
                  algorithm
                )
                  ? `${pathDistance.toFixed(1)} units`
                  : `${pathLength - 1} edges`}
              </span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm max-h-64 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <svg
                className="w-5 h-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="text-lg font-medium text-purple-400 drop-shadow-[0_0_8px_#CA00B6] animate-pulse-slow">
                {algorithmTitles[algorithm]}
              </h3>
            </div>
            <ul className="text-gray-300 text-sm space-y-2">
              {algorithmDescription[algorithm]
                .trim()
                .split("\n")
                .filter((line) => line)
                .map((line, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-teal-400 mr-2">▹</span>
                    <span>{line.replace("->", "").trim()}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathfindVisualizer;
