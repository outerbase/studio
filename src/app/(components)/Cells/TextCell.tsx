import styles from "./styles.module.css";

export default function TextCell({ value }: { value: string }) {
  return <div className={styles.cell}>{value}</div>;
}
