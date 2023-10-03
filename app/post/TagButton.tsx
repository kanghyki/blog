'use client';
import styles from './TagButton.module.css';
import { useRouter } from 'next/navigation';

type Props = {
  tag: string;
  onClick?: () => void;
  link?: boolean;
};

export default function TagButton(props: Props) {
  const router = useRouter();

  const onClick = () => {
    if (props.onClick) props.onClick();
    if (props.link) router.push(`/post?tag=${props.tag}`);
  };

  return (
    <button className={styles.tag_button} onClick={onClick}>
      {props.tag}
    </button>
  );
}
