import { Node, NodeData } from './Node';
import { Edge, EdgeData } from './Edge';

import { getForceDirectedLayout } from './visualization';

export interface GraphData {
  id: number;
  name: string;
  edges: EdgeData[];
  nodes: NodeData[];
  isTemp?: boolean;
}

export class Graph implements GraphData {
  id: number;
  name: string;
  edges: Edge[];
  nodes: Node[];
  isTemp?: boolean; // True if the graph has not been saved to the database.

  constructor(data: Partial<GraphData> = {}) {
    const { id = 1, name, edges = [], nodes = [], isTemp } = data;
    this.id = id;
    this.name = name || `Graph-${this.id}`;
    this.edges = edges.map((edge) => new Edge(edge));
    this.nodes = nodes.map((node) => new Node(node));
    if (isTemp) {
      this.isTemp = isTemp;
    }
  }

  get nextEdgeId(): number {
    return Math.max(...[...this.edges.map((e) => e.id), 0]) + 1;
  }

  get nextNodeId(): number {
    return Math.max(...[...this.nodes.map((n) => n.id), 0]) + 1;
  }

  setName(name: string) {
    this.name = name;
  }

  getNode(nodeId: number) {
    return this.nodes.find((n) => n.id === nodeId);
  }

  addNode(node: Node | NodeData) {
    node.id = Math.max(...[...this.nodes.map((n) => n.id), 0]) + 1;
    node.content = `${node.id}`;
    this.nodes.push(new Node(node));
  }

  deleteNode(node: Node | NodeData) {
    this.nodes = this.nodes.filter((n) => n.id !== node.id);
    this.edges = this.edges.filter((e) => e.sourceId !== node.id && e.targetId !== node.id);
  }

  updateNode(node: Node) {
    this.nodes = this.nodes.map((n) => (n.id === node.id ? new Node(node) : n));
  }

  getEdge(edgeId: number) {
    return this.edges.find((e) => e.id === edgeId);
  }

  addEdge(edge: Edge | EdgeData) {
    edge.id = Math.max(...[...this.edges.map((e) => e.id), 0]) + 1;
    this.edges.push(new Edge(edge));
  }

  updateEdge(edge: Edge) {
    this.edges = this.edges.map((e) => (e.id === edge.id ? new Edge(edge) : e));
  }

  deleteEdge(edge: Edge | EdgeData) {
    this.edges = this.edges.filter((e) => e.id !== edge.id);
  }

  setLayout(width: number, height: number, type: string = 'forceDirected') {
    if (type === 'forceDirected') {
      const { nodes } = getForceDirectedLayout(this, width, height);
      this.nodes = nodes;
    }
  }

  clone(): Graph {
    return new Graph(this);
  }

  isEqual(graph2: Graph): boolean {
    return JSON.stringify(this) === JSON.stringify(graph2);
  }

  toJSON(): GraphData {
    const { id, name, nodes, edges, isTemp } = this;
    return {
      id,
      name,
      nodes,
      edges,
      isTemp,
    };
  }
}
