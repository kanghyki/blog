'use client';
import styles from './TagButton.module.css';

type Props = {
  tag: string;
  onClick?: () => void;
  link?: boolean;
};

export default function TagButton(props: Props) {
  const onClick = () => {
    if (props.onClick) props.onClick();
    if (props.link) window.location.href = `/post?tag=${props.tag}`;
  };

  return (
    <button className={styles.tag_button} onClick={onClick}>
      {props.tag}
    </button>
  );
}
