import { Node } from './Node';
import { Edge } from './Edge';

export * from './Node';
export * from './Edge';
export * from './Graph';

export interface EditorConfig {
  mode: 'node' | 'edge' | 'edit';
  fill: string;
  color: string;
  radius: number;
  isDirected: boolean;
  width: number;
}

export interface Selected {
  type: 'node' | 'edge' | null;
  value: Node | Edge | null;
}

export interface EditorState {
  selected: Selected;
  nextEdgeId: number;
  nextNodeId: number;
  disabled: boolean;
  downloading: boolean;
  size: number;
  ratio: number;
}

export interface EditorActions {
  setConfig: (config: EditorConfig) => void;
  setSelected: (type?: 'node' | 'edge', id?: number) => void;
  addNode: (node: Node) => void;
  updateNode: (node: Node) => void;
  deleteNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  updateEdge: (edge: Edge) => void;
  deleteEdge: (edge: Edge) => void;
  updateName: (name: string) => void;
  setLayout: (type?: string) => void;
  downloadSvg: () => void;
  doSave: () => void;
  doDelete: () => void;
}
