import { TrieNode } from './TrieNode';

export class AutoCompleter {
  private root: TrieNode;

  constructor(root: TrieNode) {
    this.root = root;
  }

  public autoComplete(s: string, option: { max: number }): string[] {
    if (!s) return [];
    const node = this.root.find(s);
    if (!node) return [];
    return this.bfs(node, option.max);
  }

  private bfs(node: TrieNode, max: number): string[] {
    const ret: string[] = [];
    const queue: Queue<TrieNode> = new Queue<TrieNode>();
    queue.enqueue(node);

    while (!queue.isEmpty()) {
      const node = queue.dequeue();
      /* type */
      if (!node) continue;

      if (node.isWord()) ret.push(node.getValue());
      if (ret.length >= max) break;

      const children = node.getChildren();
      for (let child of children) {
        queue.enqueue(child);
      }
    }

    return ret;
  }
}

export class Queue<T> {
  private arr: T[];

  constructor() {
    this.arr = [];
  }

  public clear(): void {
    this.arr = [];
  }

  public toArray(): T[] {
    return this.arr;
  }

  public enqueue(s: T): void {
    this.arr.push(s);
  }

  public dequeue(): T | undefined {
    return this.arr.shift();
  }

  public isEmpty(): boolean {
    return this.arr.length === 0;
  }
}
