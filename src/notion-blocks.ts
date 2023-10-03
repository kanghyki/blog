import {
  BlockObjectResponse,
  BookmarkBlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  CodeBlockObjectResponse,
  EmbedBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ImageBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ParagraphBlockObjectResponse,
  QuoteBlockObjectResponse,
  RichTextItemResponse,
  ToDoBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export class NotionBlockFactory {
  constructor() {}

  public getConverter(block: BlockObjectResponse): NotionBlockConverter {
    switch (block.type) {
      case 'heading_1':
        return new Heading1Block(block);
      case 'heading_2':
        return new Heading2Block(block);
      case 'heading_3':
        return new Heading3Block(block);
      case 'paragraph':
        return new ParagraphBlock(block);
      case 'numbered_list_item':
        return new NumberedListItemBlock(block);
      case 'bulleted_list_item':
        return new BulletedListItemBlock(block);
      case 'to_do':
        return new ToDoBlock(block);
      case 'quote':
        return new QuoteBlock(block);
      case 'code':
        return new CodeBlock(block);
      case 'embed':
        return new EmbedBlock(block);
      case 'bookmark':
        return new BookmarkBlock(block);
      case 'image':
        return new ImageBlock(block);
      default:
        return new NullBlock();
    }
  }
}

export abstract class NotionBlockConverter {
  constructor() {}

  public toString(): string {
    return `${this.concatRichText()}\n`;
  }

  protected abstract concatRichText(): string;

  protected richTextToMarkdown(richText: RichTextItemResponse): string {
    let annotationText = richText.plain_text;

    if (richText.annotations.code) annotationText = `\`${annotationText}\``;
    if (richText.annotations.strikethrough) annotationText = `~~${annotationText}~~`;
    if (richText.annotations.underline) annotationText = `<u>${annotationText}</u>`;
    if (richText.annotations.bold) annotationText = `**${annotationText}**`;
    if (richText.annotations.italic) annotationText = `*${annotationText}*`;

    if (richText.href) annotationText = `[${annotationText}](${richText.href})`;

    return annotationText;
  }
}

class Heading1Block extends NotionBlockConverter {
  private block: Heading1BlockObjectResponse;

  constructor(block: Heading1BlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    for (const rich_text of this.block.heading_1.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `# ${ret}`;
  }
}

class Heading2Block extends NotionBlockConverter {
  private block: Heading2BlockObjectResponse;

  constructor(block: Heading2BlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    for (const rich_text of this.block.heading_2.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `## ${ret}`;
  }
}

class Heading3Block extends NotionBlockConverter {
  private block: Heading3BlockObjectResponse;

  constructor(block: Heading3BlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    for (const rich_text of this.block.heading_3.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `### ${ret}`;
  }
}

class ParagraphBlock extends NotionBlockConverter {
  private block: ParagraphBlockObjectResponse;

  constructor(block: ParagraphBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    for (const rich_text of this.block.paragraph.rich_text) ret += this.richTextToMarkdown(rich_text);

    return ret;
  }
}

class NumberedListItemBlock extends NotionBlockConverter {
  private block: NumberedListItemBlockObjectResponse;

  constructor(block: NumberedListItemBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    for (const rich_text of this.block.numbered_list_item.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `1. ${ret}`;
  }
}

class BulletedListItemBlock extends NotionBlockConverter {
  private block: BulletedListItemBlockObjectResponse;

  constructor(block: BulletedListItemBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    for (const rich_text of this.block.bulleted_list_item.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `- ${ret}`;
  }
}

class ToDoBlock extends NotionBlockConverter {
  private block: ToDoBlockObjectResponse;

  constructor(block: ToDoBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    const prefix = this.block.to_do.checked ? '- [x]' : '- [ ]';
    for (const rich_text of this.block.to_do.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `${prefix} ${ret}\n`;
  }
}

class QuoteBlock extends NotionBlockConverter {
  private block: QuoteBlockObjectResponse;

  constructor(block: QuoteBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    for (const rich_text of this.block.quote.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `> ${ret}`;
  }
}

class CodeBlock extends NotionBlockConverter {
  private block: CodeBlockObjectResponse;

  constructor(block: CodeBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let ret = '';
    const language = this.block.code.language ? this.block.code.language : '';
    for (const rich_text of this.block.code.rich_text) ret += this.richTextToMarkdown(rich_text);

    return `\`\`\`${language}\n${ret}\n\`\`\``;
  }
}

class EmbedBlock extends NotionBlockConverter {
  private block: EmbedBlockObjectResponse;

  constructor(block: EmbedBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let embedStr = '';
    for (const caption of this.block.embed.caption) embedStr += this.richTextToMarkdown(caption);

    return `[${embedStr ? embedStr : 'Link'}](${this.block.embed.url})`;
  }
}

class BookmarkBlock extends NotionBlockConverter {
  private block: BookmarkBlockObjectResponse;

  constructor(block: BookmarkBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    let bookmarkStr = '';
    for (const caption of this.block.bookmark.caption) bookmarkStr += this.richTextToMarkdown(caption);

    return `[${bookmarkStr ? bookmarkStr : 'Link'}](${this.block.bookmark.url})`;
  }
}

class ImageBlock extends NotionBlockConverter {
  private block: ImageBlockObjectResponse;

  constructor(block: ImageBlockObjectResponse) {
    super();
    this.block = block;
  }

  protected override concatRichText(): string {
    if (this.block.image.type === 'file') return `![block.image.caption](${this.block.image.file.url})`;

    return '';
  }
}

class NullBlock extends NotionBlockConverter {
  constructor() {
    super();
  }

  protected override concatRichText(): string {
    return '';
  }
}
