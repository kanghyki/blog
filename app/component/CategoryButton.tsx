'use client';
import styles from './CategoryButton.module.css';

type Props = {
  category: string;
  onClick?: () => void;
  link?: boolean;
};

export default function CategoryButton(props: Props) {
  const onClick = () => {
    if (props.onClick) props.onClick();
    /* FIXME: posts path */
    if (props.link) window.location.href = `/?category=${props.category}`;
  };

  return (
    <button className={styles.tag_button} onClick={onClick}>
      {props.category}
    </button>
  );
}
