import { BlogPostConverter, Searcher } from '../src/searcher/Searcher';
import { BlogPost } from '../src/BlogPost';

describe('search', () => {
  const conv = new BlogPostConverter();

  describe('word', () => {
    const searcher = new Searcher({ caseInsensitive: true });

    const catPost = new BlogPost('cat');
    catPost.title = 'cat';
    searcher.getIndexer().index(catPost.id, conv.convert(catPost));

    const dogPost = new BlogPost('dog');
    dogPost.title = 'dog';
    searcher.getIndexer().index(dogPost.id, conv.convert(dogPost));

    const upperPost = new BlogPost('upper');
    upperPost.title = 'UpPer';
    searcher.getIndexer().index(upperPost.id, conv.convert(upperPost));

    test('cat', () => {
      expect(searcher.search('cat')).toEqual(['cat']);
    });

    test('dog', () => {
      expect(searcher.search('dog')).toEqual(['dog']);
    });

    test('nothing', () => {
      expect(searcher.search('coffee')).toEqual([]);
    });

    test('not allowed special symbols', () => {
      expect(searcher.search('cat!')).toEqual([]);
      expect(searcher.search('cat@')).toEqual([]);
      expect(searcher.search('cat#')).toEqual([]);
      expect(searcher.search('cat*')).toEqual([]);
      expect(searcher.search('cat.')).toEqual([]);
    });

    test('case insensitive', () => {
      expect(searcher.search('uPpeR')).toEqual(['upper']);
    });
  });

  describe('word kr', () => {
    const searcher = new Searcher({ caseInsensitive: false });

    const catPost = new BlogPost('cat');
    catPost.title = '고양이';
    searcher.getIndexer().index(catPost.id, conv.convert(catPost));

    const dogPost = new BlogPost('dog');
    dogPost.title = '강아지';
    searcher.getIndexer().index(dogPost.id, conv.convert(dogPost));

    test('고양이', () => {
      expect(searcher.search('고양이')).toEqual(['cat']);
    });

    test('강아지', () => {
      expect(searcher.search('강아지')).toEqual(['dog']);
    });
  });

  test('priority', () => {
    const searcher = new Searcher({ caseInsensitive: false });

    const coffeePost = new BlogPost('coffee');
    coffeePost.title = 'coffee';
    coffeePost.summary = 'he is my friend john';
    coffeePost.authors = ['hyki'];
    coffeePost.category = 'coffee';
    searcher.getIndexer().index(coffeePost.id, conv.convert(coffeePost));

    const tablePost = new BlogPost('table');
    tablePost.title = 'table';
    tablePost.summary = '';
    tablePost.authors = ['john'];
    tablePost.category = 'table';
    searcher.getIndexer().index(tablePost.id, conv.convert(tablePost));

    expect(searcher.search('coffee')).toEqual(['coffee']);
    expect(searcher.search('table')).toEqual(['table']);
    expect(searcher.search('john')).toEqual(['table', 'coffee']);
  });

  describe('phrase', () => {
    const searcher = new Searcher({ caseInsensitive: false });

    const post = new BlogPost('coffee');
    post.title = 'coffee is god';
    post.summary = 'coffee are my life, he is my friend john, but pasta is... pasta is';
    post.authors = ['hyki'];
    post.category = 'coffee';
    searcher.getIndexer().index(post.id, conv.convert(post));

    const pastaPost = new BlogPost('pasta');
    pastaPost.title = 'pasta is my life';
    pastaPost.summary = 'pasta is delicious!';
    pastaPost.authors = ['hyki'];
    pastaPost.category = 'pasta';
    searcher.getIndexer().index(pastaPost.id, conv.convert(pastaPost));

    test('phrase test / double word exist', () => {
      expect(searcher.search('"coffee is"')).toEqual(['coffee']);
    });

    test('phrase test / double word non-exist', () => {
      expect(searcher.search('"is he"')).toEqual([]);
    });

    test('phrase test / ignore double quotes', () => {
      expect(searcher.search('"is he')).toEqual(['coffee', 'pasta']);
    });

    test('phrase test / multi word exist', () => {
      expect(searcher.search('"coffee are my life"')).toEqual(['coffee']);
    });

    test('phrase test / multi word non-exist', () => {
      expect(searcher.search('"coffee are your life"')).toEqual([]);
    });

    test('phrase test / multi page', () => {
      expect(searcher.search('"pasta is"')).toEqual(['pasta', 'coffee']);
    });
  });

  describe('phrase kr', () => {
    const searcher = new Searcher({ caseInsensitive: false });

    const post = new BlogPost('coffee');
    post.title = '커피는 신이다..';
    post.summary = '커피는 인생과도 같습니다. 왜냐하면 쓰기 때문이죠...☕️';
    post.authors = ['hyki'];
    post.category = '커피';
    searcher.getIndexer().index(post.id, conv.convert(post));

    const pastaPost = new BlogPost('pasta');
    pastaPost.title = '파스타는 인생이다.';
    pastaPost.summary = '맛있기 때문이죠🍝';
    pastaPost.authors = ['hyki'];
    pastaPost.category = '파스타';
    searcher.getIndexer().index(pastaPost.id, conv.convert(pastaPost));

    const fourst = new BlogPost('fourst');
    fourst.title = '오늘의 기록';
    searcher.getIndexer().index(fourst.id, conv.convert(fourst));

    test('phrase test / double word exist', () => {
      expect(searcher.search('"커피는 신이다"')).toEqual(['coffee']);
    });

    test('phrase test / double word non-exist', () => {
      expect(searcher.search('"인생과도 제"')).toEqual([]);
    });

    test('phrase test / multi word exist', () => {
      expect(searcher.search('"커피는 인생과도 같습니다"')).toEqual(['coffee']);
    });

    test('phrase test / multi word non-exist', () => {
      expect(searcher.search('"카페는 인생과도 같습니다"')).toEqual([]);
    });

    test('phrase test / multi page & single word', () => {
      expect(searcher.search('"때문이죠"')).toEqual(['pasta', 'coffee']);
    });

    test('phrase test', () => {
      expect(searcher.search('"오늘의 기록"')).toEqual(['fourst']);
      expect(searcher.search('오늘의 기록')).toEqual(['fourst']);
    });
  });
});

describe('blogpost converter', () => {
  test('', () => {
    const post = new BlogPost('1');
    post.title = 'a';
    post.summary = 'b';
    post.authors = ['c', 'd'];
    post.category = 'e';

    const conv = new BlogPostConverter();
    const ret = conv.convert(post);
    expect(ret).toEqual('<title>a</title><summary>b</summary><authors>c,d</authors><category>e</category>');
  });
});
