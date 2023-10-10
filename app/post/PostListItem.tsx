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
      <time className={styles.time_style}>{`${dateToString(props.post.createdAt, {
        type: DateStringType.YEAR_MONTH_DATE,
        time: false,
      })}\t`}</time>
      <Link href={`${process.env.NEXT_PUBLIC_POST_PATH}/${props.post.id}`}>
        {props.post.icon && `${props.post.icon} `}
        {props.post.title}
      </Link>
      <br />
      {props.post.tags.map((e: string) => (
        <span key={e} className={styles.small_tag}>
          {`#${e}`}
        </span>
      ))}
    </li>
  );
}
