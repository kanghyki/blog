import { IBlogPost } from '@/src/BlogPost';
import { Indexer, WordInfo } from './Indexer';
import { AutoCompleter } from './AutoCompleter';

export interface SearcherOption {
  caseInsensitive: boolean;
}

export class Searcher {
  private option: SearcherOption;
  private indexer: Indexer;

  constructor(option: SearcherOption) {
    this.option = option;
    this.indexer = new Indexer({ caseInsensitive: this.option.caseInsensitive });
  }

  public getIndexer(): Indexer {
    return this.indexer;
  }

  public search(query: string): string[] {
    if (query.match(/[^a-zA-z가-힣\s"]/g)) return [];

    const ret: string[] = [];
    const scores = new Map<string, number>();
    /* "asd asd <- ignore double quotes */
    const splitedWords = query.match(/([a-zA-Z가-힣]+|"[a-zA-Z가-힣\s]+")/g);

    if (!splitedWords) return [];
    for (const sw of splitedWords) {
      if (sw[0] === '"') this.searchPhrase(sw, scores);
      else this.searchWord(sw, scores);
    }

    new Map(
      Array.from(scores)
        .sort((a, b) => a[1] - b[1])
        .reverse(),
    ).forEach((value, key) => {
      ret.push(key);
    });

    return ret;
  }

  public autoComplete(s: string, option: { max: number }): string[] {
    const autoCompleter = new AutoCompleter(this.indexer.getTrie());

    return autoCompleter.autoComplete(s, option);
  }

  private findBesideWord(target: WordInfo, words: WordInfo[]): WordInfo | undefined {
    return words.find(e => e.id === target.id && e.pos - target.pos === 1);
  }

  private searchPhraseDepth(word: WordInfo, words: Array<Array<WordInfo>>, depth: number = 1): boolean {
    if (words.length <= depth) return true;

    const beside = this.findBesideWord(word, words[depth]);
    if (!beside) return false;

    return this.searchPhraseDepth(beside, words, depth + 1);
  }

  private searchPhrase(phrase: string, scores: Map<string, number>): void {
    const phraseWords = phrase.match(/([^ "]+)/g);
    if (!phraseWords) return;

    const phraseWordsArray: Array<Array<WordInfo>> = new Array<Array<WordInfo>>();
    for (const element of phraseWords)
      phraseWordsArray.push(this.indexer.find(this.option.caseInsensitive ? element.toLowerCase() : element));

    if (phraseWordsArray.length === 0) return;
    for (const word of phraseWordsArray[0]) {
      if (this.searchPhraseDepth(word, phraseWordsArray))
        this.updateScore({
          scores: scores,
          id: word.id,
          score: this.calcScore(word),
        });
    }
  }

  private searchWord(word: string, scores: Map<string, number>): void {
    const wordInfos = this.indexer.find(this.option.caseInsensitive ? word.toLowerCase() : word);

    for (const info of wordInfos)
      this.updateScore({
        scores: scores,
        id: info.id,
        score: this.calcScore(info),
      });
  }

  private isBetween(target: WordInfo, point: { start: WordInfo; end: WordInfo }): boolean {
    if (target.pos > point.start.pos && target.pos < point.end.pos) return true;
    return false;
  }

  private isInMetaWord(info: WordInfo, meta: string): boolean {
    const metaStart = this.indexer.find(`<${meta}>`);
    const metaEnd = this.indexer.find(`</${meta}>`);

    const s = metaStart.find(e => e.id === info.id);
    const e = metaEnd.find(e => e.id === info.id);
    if (!s || !e) return false;

    return this.isBetween(info, { start: s, end: e });
  }

  private calcScore(info: WordInfo): number {
    if (this.isInMetaWord(info, 'summary')) return 2;
    else if (this.isInMetaWord(info, 'title')) return 4;
    else if (this.isInMetaWord(info, 'category')) return 10;
    else if (this.isInMetaWord(info, 'authors')) return 20;

    return 1;
  }

  private updateScore(params: { scores: Map<string, number>; id: string; score: number }): void {
    const data = params.scores.get(params.id);

    if (data) params.scores.set(params.id, data + params.score);
    else params.scores.set(params.id, params.score);
  }
}

export class BlogPostConverter {
  constructor() {}

  public convert(post: IBlogPost): string {
    const ret: string[] = [];

    ret.push(`<title>${post.title}</title>`);
    ret.push(`<summary>${post.summary}</summary>`);
    ret.push(`<authors>${post.authors.join(',')}</authors>`);
    ret.push(`<category>${post.category}</category>`);

    return ret.join('');
  }
}
