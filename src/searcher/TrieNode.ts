export class TrieNode {
  private character: string;
  private _isWord: boolean;
  private children: TrieNode[];
  private value: string;

  constructor(c: string) {
    this.character = c;
    this._isWord = false;
    this.children = new Array<TrieNode>();
    this.value = '';
  }

  public getCharacter(): string {
    return this.character;
  }

  public getChildren(): TrieNode[] {
    return this.children;
  }

  public isWord(): boolean {
    return this._isWord;
  }

  public getValue(): string {
    return this.value;
  }

  public insert(s: string): void {
    this.insertIn(s);
  }

  private insertIn(s: string, value?: string): void {
    if (value) this.value = value;
    if (s.length === 0) {
      this._isWord = true;
      return;
    }

    const c = s.substring(0, 1);
    const sub = s.substring(1);

    const child = this.getChild(c);
    if (child) child.insertIn(sub);
    else {
      const node = new TrieNode(c);
      this.children.push(node);
      node.insertIn(sub, this.value + c);
    }
  }

  public find(c: string): TrieNode | undefined {
    if (c.length <= 0) return this;

    const child = this.getChild(c.substring(0, 1));
    if (child) return child.find(c.substring(1));
    return undefined;
  }

  private getChild(c: string): TrieNode | undefined {
    for (const child of this.children) {
      if (child.isChracter(c)) return child;
    }
    return undefined;
  }

  private isChracter(c: string): boolean {
    return this.character === c;
  }
}
