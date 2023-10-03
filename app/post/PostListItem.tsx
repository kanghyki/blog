import styles from './PostListItem.module.css';
import { DateStringType, dateToString } from '@/src/util';
import { PostProp } from './PostList';

type Props = {
  post: PostProp;
};

export default function PostListItem(props: Props) {
  return (
    <li className={styles.post_list_item}>
      <time className={styles.time_style}>{`${dateToString(props.post.createdAt, {
        type: DateStringType.YEAR_MONTH_DATE,
        time: false,
      })}\t`}</time>
      <a href={`/post/${props.post.id}`}>{`${props.post.title}`}</a>
      <br />
      {props.post.tags.map((e: string) => (
        <span key={e} className={styles.small_tag}>
          {`#${e}`}
        </span>
      ))}
    </li>
  );
}
