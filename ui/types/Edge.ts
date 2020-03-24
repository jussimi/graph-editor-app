export interface EdgeData {
  id: number;
  sourceId: number | undefined;
  targetId: number | undefined;
  isDirected: boolean;
  fill: string;
  width: number;
}

export class Edge implements EdgeData {
  id: number;
  sourceId: number | undefined;
  targetId: number | undefined;
  isDirected: boolean;
  fill: string;
  width: number;

  constructor(data: Partial<EdgeData> = {}) {
    const { id = 0, sourceId, targetId, isDirected = true, fill = '#000000', width = 5 } = data;
    this.id = id;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.isDirected = isDirected;
    this.fill = fill;
    this.width = width;
  }

  setDirected(isDirected: boolean) {
    this.isDirected = isDirected;
  }

  setFill(fill: string) {
    this.fill = fill;
  }

  setWidth(width: number) {
    this.width = width;
  }
}
