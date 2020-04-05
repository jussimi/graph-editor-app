import { Graph, Node, GraphData } from './index';

/**
 Force-directed layout using Fruchterman & Reingold’s Algorithm 
*/
export const getForceDirectedLayout = (initialGraph: Graph | GraphData, width: number, height: number): Graph => {
  const graph = new Graph(initialGraph);
  const area = width * height;
  const c = 3; // Scale variable, can be changed
  const k = c * Math.sqrt(area / graph.nodes.length); // Optimal edge-length
  //
  const getDistance = (node1: Node, node2: Node): number => {
    const distance = Math.sqrt((node2.x - node1.x) ** 2 + (node2.y - node1.y) ** 2);
    return distance;
  };
  const attractiveForce = (distance: number): number => {
    return distance ** 2;
  };
  const repulsiveForce = (distance: number): number => {
    const u = 2 * k - distance > 0 ? 1 : 0;
    return -(k ** 2 / distance) * u;
  };
  // Place nodes in random positions
  const nodes = graph.nodes.map(
    (n) =>
      new Node({
        ...n,
        x: width / 4 + (Math.random() * width) / 2,
        y: height / 4 + (Math.random() * height) / 2,
      })
  );
  const { edges } = graph;
  const maxIterations = 200;
  const nodeDisplacementMap: { [nodeId: number]: { dispX: number; dispY: number } } = {};
  let temperature = width / 10; // Temperature.
  for (let currIteration = 0; currIteration < maxIterations; currIteration += 1) {
    // Count repulsive forces
    for (const node1 of nodes) {
      let dispX = 0;
      let dispY = 0;
      for (const node2 of nodes) {
        if (node1.id === node2.id) continue;
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = getDistance(node1, node2);
        const force = repulsiveForce(distance);
        if (distance > 0) {
          dispX = dispX + (dx / distance) * force;
          dispY = dispY + (dy / distance) * force;
        }
      }
      nodeDisplacementMap[node1.id] = { dispX, dispY };
    }
    // Count attraction forces
    for (const edge of edges) {
      const source = nodes.find((n) => n.id === edge.sourceId);
      const target = nodes.find((n) => n.id === edge.targetId);
      if (source && target) {
        const sourceDisp = nodeDisplacementMap[source.id];
        const targetDisp = nodeDisplacementMap[target.id];
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = getDistance(source, target);
        const force = attractiveForce(distance);
        if (distance > 0) {
          nodeDisplacementMap[source.id] = {
            dispX: sourceDisp.dispX + (dx / distance) * force,
            dispY: sourceDisp.dispY + (dy / distance) * force,
          };
          nodeDisplacementMap[target.id] = {
            dispX: targetDisp.dispX - (dx / distance) * force,
            dispY: targetDisp.dispY - (dy / distance) * force,
          };
        }
      }
    }
    // limit the maximum displacement to the temperature,
    // and then prevent from being displaced outside frame
    for (const node of nodes) {
      const { dispX, dispY } = nodeDisplacementMap[node.id];
      // Displacement length
      const distance = Math.sqrt(dispX * dispX + dispY * dispY);
      // Limit to the temperature t.
      node.x = node.x + (dispX / distance) * Math.min(distance, temperature);
      node.y = node.y + (dispY / distance) * Math.min(distance, temperature);

      // Stay inside frame
      const offset = 2 * node.radius + 30;
      if (node.x < offset) {
        node.x = offset;
      } else if (node.x > width - offset) {
        node.x = width - offset;
      }
      if (node.y < offset) {
        node.y = offset;
      } else if (node.y > height - offset) {
        node.y = height - offset;
      }
    }
    // Cool temperature
    temperature = temperature - temperature / (maxIterations + 1);
  }
  graph.nodes = nodes;
  return graph;
};
