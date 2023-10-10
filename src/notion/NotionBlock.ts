import {
  BlockObjectResponse,
  BookmarkBlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  CodeBlockObjectResponse,
  DividerBlockObjectResponse,
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
import { uploadS3 } from '../AWS-S3';

export class NotionBlockFactory {
  constructor() {}

  public getBlock(block: BlockObjectResponse): NotionBlock {
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
      case 'divider':
        return new DividerBlock(block);
      default:
        return new NullBlock();
    }
  }
}

export abstract class NotionBlock {
  constructor() {}

  public abstract toMarkdown(): string;
  public async storeExternalStorage(): Promise<void> {}

  protected concatRichText(items: Array<RichTextItemResponse>): string {
    let ret: string = '';
    for (const item of items) ret += this.richTextToMarkdown(item);

    return ret;
  }

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

class Heading1Block extends NotionBlock {
  private block: Heading1BlockObjectResponse;

  constructor(block: Heading1BlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.heading_1.rich_text);

    return `# ${concat}\n`;
  }
}

class Heading2Block extends NotionBlock {
  private block: Heading2BlockObjectResponse;

  constructor(block: Heading2BlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.heading_2.rich_text);

    return `## ${concat}\n`;
  }
}

class Heading3Block extends NotionBlock {
  private block: Heading3BlockObjectResponse;

  constructor(block: Heading3BlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.heading_3.rich_text);

    return `### ${concat}\n`;
  }
}

class ParagraphBlock extends NotionBlock {
  private block: ParagraphBlockObjectResponse;

  constructor(block: ParagraphBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.paragraph.rich_text);

    return concat ? `\n${concat}\n` : '\n<br/>\n\n';
  }
}

class NumberedListItemBlock extends NotionBlock {
  private block: NumberedListItemBlockObjectResponse;

  constructor(block: NumberedListItemBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.numbered_list_item.rich_text);

    return `1. ${concat}\n`;
  }
}

class BulletedListItemBlock extends NotionBlock {
  private block: BulletedListItemBlockObjectResponse;

  constructor(block: BulletedListItemBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.bulleted_list_item.rich_text);

    return `- ${concat}\n`;
  }
}

class ToDoBlock extends NotionBlock {
  private block: ToDoBlockObjectResponse;

  constructor(block: ToDoBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.to_do.rich_text);
    const prefix = this.block.to_do.checked ? '- [x]' : '- [ ]';

    return `${prefix} ${concat}\n`;
  }
}

class QuoteBlock extends NotionBlock {
  private block: QuoteBlockObjectResponse;

  constructor(block: QuoteBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.quote.rich_text);

    return concat.replace(/^(.*)$/gm, '> $1') + '\n';
  }
}

class CodeBlock extends NotionBlock {
  private block: CodeBlockObjectResponse;

  constructor(block: CodeBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const language = this.block.code.language ? this.block.code.language : '';
    const concat = this.concatRichText(this.block.code.rich_text);

    return `\`\`\`${language}\n${concat}\n\`\`\`\n`;
  }
}

class EmbedBlock extends NotionBlock {
  private block: EmbedBlockObjectResponse;

  constructor(block: EmbedBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.embed.caption);

    return `\n[${concat ? '🔗 ' + concat : '🔗 Link'}](${this.block.embed.url})\n`;
  }
}

class BookmarkBlock extends NotionBlock {
  private block: BookmarkBlockObjectResponse;

  constructor(block: BookmarkBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.bookmark.caption);

    return `\n[${concat ? '🔗 ' + concat : '🔗 Link'}](${this.block.bookmark.url})\n`;
  }
}

class ImageBlock extends NotionBlock {
  private block: ImageBlockObjectResponse;
  private url: string;

  constructor(block: ImageBlockObjectResponse) {
    super();
    this.block = block;
    this.url = '';
  }

  public override async storeExternalStorage(): Promise<void> {
    if (this.block.image.type !== 'file') return;

    const imageResponse = await fetch(this.block.image.file.url, {
      cache: 'force-cache',
    });
    if (imageResponse.status < 200 && imageResponse.status >= 300) return;

    try {
      const key = await uploadS3(await imageResponse.blob());
      const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_DOMAIN}/${key}`;
      this.url = s3Url;
    } catch (error) {}
  }

  public override toMarkdown(): string {
    const concat = this.concatRichText(this.block.image.caption);

    switch (this.block.image.type) {
      case 'file':
        if (!this.url) this.url = this.block.image.file.url;
        return `![${concat ? concat : 'image'}](${this.url})\n`;
      default:
        return '\n';
    }
  }
}

class DividerBlock extends NotionBlock {
  private block: DividerBlockObjectResponse;

  constructor(block: DividerBlockObjectResponse) {
    super();
    this.block = block;
  }

  public override toMarkdown(): string {
    return '\n---\n';
  }
}

class NullBlock extends NotionBlock {
  constructor() {
    super();
  }

  public override toMarkdown(): string {
    return '\n< ❌ Unsupported Block />\n';
  }
}
