import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionAPI } from './notion/NotionAPI';
import { NotionAPIDatabaseAdapter, NotionAPIPageAdapter } from './notion/NotionAPIAdapter';
import {
  GetBlockCommand,
  GetDatabaseCommand,
  GetDatabaseQueryCommand,
  GetPageCommand,
  GetUserCommand,
} from './notion/NotionAPICommand';
import { NotionBlockFactory } from './notion/NotionBlock';

export enum BlogPostStatus {
  Published = 'Published',
}

export interface IBlogPost {
  id: string;
  title: string;
  createdAt: Date;
  content: string;
  authors: string[];
  category: string;
  tags: string[];
  icon: string;
  summary: string;
}

export class BlogPost implements IBlogPost {
  public id: string;
  public title: string;
  public createdAt: Date;
  public content: string;
  public authors: string[];
  public tags: string[];
  public category: string;
  public icon: string;
  public summary: string;

  constructor(id: string) {
    this.id = id;
    this.title = '';
    this.createdAt = new Date(0);
    this.content = '';
    this.authors = [];
    this.tags = [];
    this.category = '';
    this.icon = '';
    this.summary = '';
  }

  public addAuthor(author: string): void {
    this.authors.push(author);
  }

  public toInterface(): IBlogPost {
    return {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
      content: this.content,
      authors: this.authors,
      category: this.category,
      tags: this.tags,
      icon: this.icon,
      summary: this.summary,
    };
  }

  // 유효한 포스트인지 확인
  public isValid(): boolean {
    return this.id !== '' && this.title !== '';
  }
}

export class NullBlogPost extends BlogPost {
  constructor() {
    super('');
  }

  public isValid(): boolean {
    return false;
  }
}

// 공통 함수: 사용자 정보를 가져와서 BlogPost에 추가
async function populateAuthors(api: NotionAPI, blogPost: BlogPost, authorIds: string[]): Promise<void> {
  const authorPromises = authorIds.map(async authorId => {
    try {
      const cmd = new GetUserCommand({ user_id: authorId });
      const user = await api.send(cmd);
      return user?.name || null;
    } catch (error) {
      console.warn(`Failed to fetch user ${authorId}:`, error);
      return null;
    }
  });

  const authorNames = await Promise.all(authorPromises);
  authorNames.filter((name): name is string => name !== null).forEach(name => blogPost.addAuthor(name));
}

// 공통 함수: PageObjectResponse에서 BlogPost 데이터 추출
function extractBlogPostData(
  adapter: NotionAPIPageAdapter,
  page: PageObjectResponse,
): {
  title: string;
  date: Date;
  authorIds: string[];
  tags: string[];
  category: string;
  summary: string;
  icon: string;
} {
  return {
    title: adapter.readTitle('title'),
    date: adapter.readDate('Date'),
    authorIds: adapter.readPeopleId('author'),
    tags: adapter.readMultiSelect('tags'),
    category: adapter.readSelect('category'),
    summary: adapter.readText('summary'),
    icon: page.icon?.type === 'emoji' ? page.icon.emoji : '',
  };
}

export async function getCategories(api: NotionAPI): Promise<string[]> {
  try {
    const command = new GetDatabaseCommand({
      database_id: `${process.env.NOTION_DB_ID}`,
    });
    const res = await api.send(command);

    if (!res) return [];

    const adapter = new NotionAPIDatabaseAdapter(res);
    return adapter.readSelect('category');
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getDbPage(api: NotionAPI): Promise<PageObjectResponse[]> {
  try {
    const command = new GetDatabaseQueryCommand({
      params: {
        database_id: `${process.env.NOTION_DB_ID}`,
        filter: {
          property: 'Status',
          status: {
            equals: BlogPostStatus.Published,
          },
        },
        sorts: [
          {
            property: 'Date',
            direction: 'descending',
          },
        ],
      },
    });
    const res = await api.send(command);

    return res || [];
  } catch (error) {
    console.error('Failed to fetch database pages:', error);
    return [];
  }
}

export async function getPosts(api: NotionAPI): Promise<BlogPost[]> {
  try {
    const pages = await getDbPage(api);
    const posts: BlogPost[] = [];

    // 병렬 처리로 성능 개선
    const postPromises = pages.map(async page => {
      const adapter = new NotionAPIPageAdapter(page);
      const blogPost = new BlogPost(adapter.id);

      const data = extractBlogPostData(adapter, page);

      // 기본 데이터 설정
      blogPost.title = data.title;
      blogPost.createdAt = data.date;
      blogPost.tags = data.tags;
      blogPost.category = data.category;
      blogPost.summary = data.summary;
      blogPost.icon = data.icon;

      // 작성자 정보 비동기 처리
      await populateAuthors(api, blogPost, data.authorIds);

      return blogPost;
    });

    const results = await Promise.allSettled(postPromises);

    // 성공한 결과만 추출
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.isValid()) {
        posts.push(result.value);
      } else if (result.status === 'rejected') {
        console.warn('Failed to process post:', result.reason);
      }
    });

    return posts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

export async function getPost(api: NotionAPI, id: string): Promise<BlogPost> {
  try {
    const command = new GetPageCommand({ page_id: id });
    const res = await api.send(command);

    if (!res) return new NullBlogPost();

    const adapter = new NotionAPIPageAdapter(res);
    const blogPost = new BlogPost(id);

    const data = extractBlogPostData(adapter, res);

    // 기본 데이터 설정
    blogPost.title = data.title;
    blogPost.createdAt = data.date;
    blogPost.tags = data.tags;
    blogPost.category = data.category;
    blogPost.summary = data.summary;
    blogPost.icon = data.icon;

    // 작성자 정보 처리
    await populateAuthors(api, blogPost, data.authorIds);

    return blogPost.isValid() ? blogPost : new NullBlogPost();
  } catch (error) {
    console.error(`Failed to fetch post ${id}:`, error);
    return new NullBlogPost();
  }
}

/**
 * @deprecated Use n2m instead for better performance and features
 */
export async function getPageContent(api: NotionAPI, id: string): Promise<string> {
  try {
    const command = new GetBlockCommand({ page_id: id });
    const res = await api.send(command);

    if (!res) return '';

    const factory = new NotionBlockFactory();
    let content = '';

    for (const node of res) {
      const block = factory.getBlock(node.block);
      content += block.toMarkdown();
    }

    return content;
  } catch (error) {
    console.error(`Failed to fetch page content ${id}:`, error);
    return '';
  }
}
