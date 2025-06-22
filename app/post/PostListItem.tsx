import styles from './PostListItem.module.css';
import { DateStringType, dateToString } from '@/src/util';
import Link from 'next/link';
import { IBlogPost } from '@/src/BlogPost';
import TagList from '../component/TagList';

type Props = {
  post: IBlogPost;
};

export default function PostListItem(props: Props) {
  return (
    <li className={styles.post_list_item}>
      <Link href={`${process.env.NEXT_PUBLIC_POST_PATH}/${props.post.id}`}>
        <span className={styles.post_icon}>{props.post.icon && `${props.post.icon} `}</span>
        <span className={styles.post_title}>{props.post.title}</span>
        <summary className={styles.summary}>{props.post.summary}</summary>
      </Link>
      <div className={styles.tagSection}>
        <TagList tags={props.post.tags} maxVisible={3} />
      </div>
      <PostInfo post={props.post} />
    </li>
  );
}

type PropsPostInfo = {
  post: IBlogPost;
};

export function PostInfo(props: PropsPostInfo) {
  return (
    <div className={styles.info}>
      <span>{props.post.category ? `${props.post.category}` : '<No Category>'}</span>
      <span>
        <time>
          {props.post.createdAt.getTime() === 0
            ? '<No date>'
            : `${dateToString(props.post.createdAt, {
                type: DateStringType.YEAR_MONTH_DATE,
                time: false,
              })}\t`}
        </time>
      </span>
      <span>{props.post.authors.length > 0 ? `${props.post.authors.join(', ')}` : '<No author>'}</span>
    </div>
  );
}
