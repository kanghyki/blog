import styles from './PostListItem.module.css';
import { DateStringType, dateToString } from '@/src/util';
import Link from 'next/link';
import { IBlogPost } from '@/src/BlogPost';

type Props = {
  post: IBlogPost;
};

export default function PostListItem(props: Props) {
  return (
    <li className={styles.post_list_item}>
      <strong className={styles.link}>
        <Link href={`${process.env.NEXT_PUBLIC_POST_PATH}/${props.post.id}`}>
          {props.post.icon && `${props.post.icon} `}
          {props.post.title}
        </Link>
      </strong>
      <summary className={styles.summary}>{props.post.summary}</summary>
      <div className={styles.info}>
        {props.post.category && (
          <>
            <span className={styles.category}>{props.post.category}</span>
            <span className={styles.divider}>{' | '}</span>
          </>
        )}
        <time className={styles.time}>{`${dateToString(props.post.createdAt, {
          type: DateStringType.YEAR_MONTH_DATE,
          time: false,
        })}\t`}</time>
        <span className={styles.divider}>{' | '}</span>
        <span className={styles.author_name}>
          {props.post.authors.length > 0 ? `${props.post.authors.join(', ')}` : 'Not set'}
        </span>
      </div>
    </li>
  );
}
