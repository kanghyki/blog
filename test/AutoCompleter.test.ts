import { AutoCompleter } from '../src/searcher/AutoCompleter';
import { TrieNode } from '../src/searcher/TrieNode';

describe('TrieNode', () => {
  test('getCharacter', () => {
    const node = new TrieNode('c');
    expect(node.getCharacter()).toEqual('c');
  });

  test('getChildren', () => {
    const root = new TrieNode('');
    root.insert('a');
    root.insert('b');

    const children = root.getChildren();
    expect(children.length).toEqual(2);

    root.insert('ab');
    root.insert('a1');
    const aNode = children.find(e => e.getCharacter() === 'a');
    expect(aNode?.getChildren().length).toEqual(2);
  });

  test('find', () => {
    const root = new TrieNode('');
    root.insert('abcde');
    root.insert('abcdf');
    root.insert('qwer');
    root.insert('1234');
    expect(root.find('abcde') !== undefined).toEqual(true);
    expect(root.find('abcdf') !== undefined).toEqual(true);
    expect(root.find('qwer') !== undefined).toEqual(true);
    expect(root.find('1234') !== undefined).toEqual(true);
    expect(root.find('12345') !== undefined).toEqual(false);
  });

  test('getValue', () => {
    const root = new TrieNode('');
    root.insert('car');
    const node = root.find('car');

    expect(node?.getValue()).toEqual('car');
  });

  test('isWord', () => {
    const root = new TrieNode('');
    root.insert('hello');

    expect(root.find('hello')?.isWord()).toEqual(true);
    expect(root.find('hel')?.isWord()).toEqual(false);
  });
});

describe('AutoCompleter', () => {
  test('autoComplete', () => {
    const root = new TrieNode('');
    root.insert('test1');
    root.insert('test2');
    root.insert('test3');
    root.insert('test4');
    const completer = new AutoCompleter(root);
    expect(completer.autoComplete('tes', { max: 4 })).toEqual(['test1', 'test2', 'test3', 'test4']);
    expect(completer.autoComplete('tea', { max: 4 })).toEqual([]);
  });
});
