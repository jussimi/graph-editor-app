export interface NodeData {
  id: number;
  x: number;
  y: number;
  fill: string;
  color: string;
  content: string;
  radius: number;
}

export class Node implements NodeData {
  id: number;
  x: number;
  y: number;
  fill: string;
  color: string;
  content: string;
  radius: number;

  constructor(data: Partial<NodeData> = {}) {
    const { id = 0, content, x = 0, y = 0, fill = '#000000', color = '#ffffff', radius = 40 } = data;
    this.id = id;
    this.content = content || id.toString();
    this.x = x;
    this.y = y;
    this.color = color;
    this.fill = fill;
    this.radius = radius;
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setFill(fill: string) {
    this.fill = fill;
  }

  setColor(color: string) {
    this.color = color;
  }

  setRadius(radius: number) {
    this.radius = radius;
  }

  setContent(content: string) {
    this.content = content;
  }

  clone(): Node {
    return new Node(this);
  }
}
