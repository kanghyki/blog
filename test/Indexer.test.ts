import { Indexer } from '../src/searcher/Indexer';

describe('Indexer', () => {
  test('TestMapArrayPush', () => {
    const map = new Map<string, string[]>();
    map.set('a', ['1', '2', '3']);
    const value = map.get('a');
    if (value) value.push('4');

    const expected = new Map<string, string[]>();
    expected.set('a', ['1', '2', '3', '4']);

    expect(map).toEqual(expected);
  });
  test('indexing', () => {
    const index = new Indexer({ caseInsensitive: false });

    {
      const page_id = 'page one';
      const page = 'dog rice news english expression polar laptop desktop';
      index.index(page_id, page);
    }
    {
      const page_id = 'page two';
      const page = 'dog rice song nine';
      index.index(page_id, page);
    }

    expect(index.find('dog').sort()).toEqual(
      [
        { id: 'page one', pos: 0 },
        { id: 'page two', pos: 0 },
      ].sort(),
    );
    expect(index.find('rice').sort()).toEqual(
      [
        { id: 'page one', pos: 1 },
        { id: 'page two', pos: 1 },
      ].sort(),
    );
    expect(index.find('desktop').sort()).toEqual([{ id: 'page one', pos: 7 }].sort());
  });

  test('enhanced indexing', () => {
    const index = new Indexer({ caseInsensitive: false });

    const page_id = 'page';
    const page = 'dog..cat,and@i-know-it-time "asd asd" sleep';
    index.index(page_id, page);

    expect(index.find('dog')).toEqual([{ id: 'page', pos: 0 }]);
    expect(index.find('cat')).toEqual([{ id: 'page', pos: 1 }]);
    expect(index.find('and')).toEqual([{ id: 'page', pos: 2 }]);
    expect(index.find('i')).toEqual([{ id: 'page', pos: 3 }]);
    expect(index.find('know')).toEqual([{ id: 'page', pos: 4 }]);
    expect(index.find('it')).toEqual([{ id: 'page', pos: 5 }]);
    expect(index.find('time')).toEqual([{ id: 'page', pos: 6 }]);
    expect(index.find('"asd asd"')).toEqual([{ id: 'page', pos: 7 }]);
    expect(index.find('sleep')).toEqual([{ id: 'page', pos: 8 }]);
  });

  test('enhanced indexing / <metatag>', () => {
    const index = new Indexer({ caseInsensitive: false });

    const page_id = 'page';
    const page = '<title>a</title><asd>a</asd>';
    index.index(page_id, page);

    expect(index.find('<title>')).toEqual([{ id: 'page', pos: 0 }]);
    expect(index.find('a')).toEqual([
      { id: 'page', pos: 1 },
      { id: 'page', pos: 4 },
    ]);
    expect(index.find('</title>')).toEqual([{ id: 'page', pos: 2 }]);
    expect(index.find('<asd>')).toEqual([{ id: 'page', pos: 3 }]);
    expect(index.find('a')).toEqual([
      { id: 'page', pos: 1 },
      { id: 'page', pos: 4 },
    ]);
    expect(index.find('</asd>')).toEqual([{ id: 'page', pos: 5 }]);
  });
});
