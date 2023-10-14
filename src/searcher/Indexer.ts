import { TrieNode } from './TrieNode';

export interface WordInfo {
  id: string;
  pos: number;
}

export interface IndexerOption {
  caseInsensitive: boolean;
}

export class Indexer {
  private storage: Map<string, WordInfo[]>;
  private option: IndexerOption;
  private trie: TrieNode;

  constructor(option: IndexerOption) {
    this.storage = new Map<string, WordInfo[]>();
    this.option = option;
    this.trie = new TrieNode('');
  }

  public find(word: string): WordInfo[] {
    const wordIndex = this.storage.get(word);
    if (wordIndex) return wordIndex;
    return [];
  }

  public index(id: string, data: string): void {
    const words = data.match(/[<]?\/?([a-zA-Z가-힣]+|".+")[>]?/g);
    if (!words) return;
    if (this.option.caseInsensitive) {
      for (let i = 0; i < words.length; i++) {
        this.addIndex({ id: id, pos: i }, words[i].toLowerCase());
        this.trie.insert(words[i].toLowerCase());
      }
    } else {
      for (let i = 0; i < words.length; i++) {
        this.addIndex({ id: id, pos: i }, words[i]);
        this.trie.insert(words[i]);
      }
    }
  }

  public getTrie(): TrieNode {
    return this.trie;
  }

  public getWords(): string[] {
    return Array.from(this.storage.keys());
  }

  public toJson() {
    return JSON.stringify(Object.fromEntries(this.storage));
  }

  public fromJson(json: string) {
    this.storage = new Map(Object.entries(JSON.parse(json)));
    for (const key of Array.from(this.storage.keys())) this.trie.insert(key);
  }

  private addIndex(wl: WordInfo, word: string) {
    const wordIndex = this.storage.get(word);
    if (wordIndex) wordIndex.push(wl);
    else this.storage.set(word, [wl]);
  }
}
